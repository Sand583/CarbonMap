
//Set up a satellite background
Map.setOptions('Satellite');

//Center the map to AOI
Map.centerObject(aoi,13);

//Change style of cursor to 'crosshair'
Map.style().set('cursor', 'crosshair');

// LANDSAT 8
function maskL8sr(image) {
  // Bits 3 and 5 are cloud shadow and cloud, respectively.
  var cloudShadowBitMask = (1 << 3);
  var cloudsBitMask = (1 << 5);
  // Get the pixel QA band.
  var qa = image.select('pixel_qa');
  // Both flags should be set to zero, indicating clear conditions.
  var mask = qa.bitwiseAnd(cloudShadowBitMask).eq(0)
                 .and(qa.bitwiseAnd(cloudsBitMask).eq(0));

  return image.updateMask(mask);
}

var dataset = ee.ImageCollection('LANDSAT/LC08/C01/T1_SR')
                  .filterDate('2017-01-01', '2020-12-31')
                  .map(maskL8sr);
                  
var visParams = {
  bands: ['B4', 'B3', 'B2'],
  min: 0,
  max: 3000,
  gamma: 1.4,
};
var composite = dataset.median().clip(aoi.geometry());
//Map.addLayer(composite, visParams, 'composite');

// Global Forest Watch
var hansen = ee.Image("UMD/hansen/global_forest_change_2018_v1_6").clip(aoi.geometry());
//Map.addLayer(hansen, {}, 'hansen');

// Select the land/water mask.
var datamask = hansen.select('datamask');

// Create a binary mask.
var maskwater = datamask.eq(1);

// Update the composite mask with the water mask.
var maskedComposite = composite.updateMask(maskwater);

// Display the masked composite
//Map.addLayer(maskedComposite, visParams, 'masked');

var ndvi = maskedComposite.normalizedDifference(['B5', 'B4']).rename('NDVI');

var ndvimask = ndvi.gte(0);
var maskedndvi = ndvi.updateMask(ndvimask);

var carbon = maskedndvi.multiply(148.453).add(16.591).rename('carbon');
//Map.addLayer(carbon, {}, 'carbon');

var carbonpx = carbon.divide(10000).multiply(900);
//Map.addLayer(carbonpx, {}, 'carbonpx');

var total = carbonpx.reduceRegion({
  reducer: ee.Reducer.sum(),
  geometry: aoi,
  scale: 30,
  maxPixels: 1e11
});

var tc = total.getNumber('carbon');

var tci = tc.getInfo();

print('Total carbon: ', tc, 'Megagram');

var market = 20;

var currency = 'USD';

var price = tc.multiply(market);

var p = price.getInfo();

print('Total carbon value: ', p, currency);

// UI

// Create an inspector panel with a horizontal layout.
var inspector = ui.Panel({
  layout: ui.Panel.Layout.flow('horizontal')
});

// Add a label to the panel.
inspector.add(ui.Label('Click to get Above Ground Carbon value'));

// Add the panel to the default map.
Map.add(inspector);

//Create a function to be invoked when the map is clicked
Map.onClick(function(coords){
  
// Clear the panel and show a loading message.
inspector.clear();
inspector.style().set('shown', true);
inspector.add(ui.Label('Loading...', {color: 'gray'}));
  
//Computer the carbon value
var point = ee.Geometry.Point(coords.lon, coords.lat);
var reduce = carbon.reduce(ee.Reducer.first());
var sampledPoint = reduce.reduceRegion(ee.Reducer.first(), point, 30);
var computedValue = sampledPoint.get('first');  

// Request the value from the server and use the results in a function.
computedValue.evaluate(function(result) {
inspector.clear();

// Add a label with the results from the server.
inspector.add(ui.Label({
      value: 'Above Ground Carbon: ' + result.toFixed(2) + ' Megagram',
      style: {stretch: 'vertical'}
    }));

// Add a button to hide the Panel.
    inspector.add(ui.Button({
      label: 'Close',
      onClick: function() {
        inspector.style().set('shown', false);
      }
    }));
  });
});

// Generate main panel and add it to the map.
var panel = ui.Panel({style: {width:'256px'}});
ui.root.insert(0,panel);

// Define title and description.
var intro = ui.Label('The Value of Forest ',
  {fontWeight: 'bold', fontSize: '24px', margin: '10px 5px'}
);
var subtitle = ui.Label('This app is for valuating forest value based on its carbon stock. Please consider donating or visiting this area to support its conservation'
  , {});

// Add title and description to the panel.  
panel.add(intro).add(subtitle);

var carbonviz = {palette: ['d9f0a3', 'addd8e', '78c679', '41ab5d', '238443', '005a32']};
var viridis = {min: 0 , max : 200,palette : ['#481567FF','#482677FF','#453781FF','#404788FF','#39568CFF',
                                              '#33638DFF','#2D708EFF','#287D8EFF','#238A8DFF','#1F968BFF',
                                              '#20A387FF','#29AF7FFF','#3CBB75FF','#55C667FF',
                                              '#73D055FF','#95D840FF','#B8DE29FF','#DCE319FF','#FDE725FF','fd2206' 
]};

Map.addLayer(carbon, viridis, 'carbon');

//Carbon Legend
///////////////

// This uses function to construct a legend for the given single-band vis
// parameters.  Requires that the vis parameters specify 'min' and 
// 'max' but not 'bands'.
function makeLegend2 (viridis) {
  var lon = ee.Image.pixelLonLat().select('longitude');
  var gradient = lon.multiply((viridis.max-viridis.min)/100.0).add(viridis.min);
  var legendImage = gradient.visualize(viridis);
  
  var thumb = ui.Thumbnail({
    image: legendImage, 
    params: {bbox:'0,0,100,8', dimensions:'256x20'},  
    style: {position: 'bottom-center'}
  });
  var panel2 = ui.Panel({
    widgets: [
      ui.Label('Megagram C'), 
      ui.Label({style: {stretch: 'horizontal'}}), 
      ui.Label('200 tonnes C/Ha')
    ],
    layout: ui.Panel.Layout.flow('horizontal'),
    style: {stretch: 'horizontal', maxWidth: '270px', padding: '0px 0px 0px 8px'}
  });
  return ui.Panel().add(panel2).add(thumb);
}

var extLabel = ui.Label({value:'Mangrove Extent ',
style: {fontWeight: 'bold', fontSize: '16px', margin: '10px 5px'}
});

var carbonLabel = ui.Label({value:'This area contain a total of'+ tci + ' '+ ' Megagram of Above Ground Biomass Carbon.' +
  ' Equal to '+  currency + p +'',
style: {fontWeight: 'bold', fontSize: '16px', margin: '10px 5px'}
});


panel
      .add(carbonLabel)
      .add(makeLegend2(viridis))
;
