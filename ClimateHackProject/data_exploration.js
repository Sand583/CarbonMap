// Step 1. Prepare boundaries 

var qc = sulawesi_qc.merge(sulawesi_qc2.merge(sulawesi_qc3.merge(sulawesi_qc4.merge(sulawesi_qc5))));
var bound = sulawesi_p.geometry().bounds();
 
var giri = ee.Image('LANDSAT/MANGROVE_FORESTS/2000').clip(sulawesi_p);
//Map.addLayer(giri, {palette: 'red'}, 'Giri');


// Dataset exploration
// LANDSAT 7
/**
 * Function to mask clouds based on the pixel_qa band of Landsat SR data.
 * @param {ee.Image} image Input Landsat SR image
 * @return {ee.Image} Cloudmasked Landsat image
 */
var cloudMaskL457 = function(image) {
  var qa = image.select('pixel_qa');
  // If the cloud bit (5) is set and the cloud confidence (7) is high
  // or the cloud shadow bit is set (3), then it's a bad pixel.
  var cloud = qa.bitwiseAnd(1 << 5)
                  .and(qa.bitwiseAnd(1 << 7))
                  .or(qa.bitwiseAnd(1 << 3));
  // Remove edge pixels that don't occur in all bands
  var mask2 = image.mask().reduce(ee.Reducer.min());
  return image.updateMask(cloud.not()).updateMask(mask2);
};

var dataset = ee.ImageCollection('LANDSAT/LE07/C01/T1_SR')
                  .filterDate('2009-01-01', '2009-12-31')
                  .map(cloudMaskL457);

var visParams = {
  bands: ['B3', 'B2', 'B1'],
  min: 0,
  max: 3000,
  gamma: 1.4,
};
var composite = dataset.median().clip(qc.geometry());
//Map.addLayer(composite, visParams, 'composite');
//SRTM Digital Elevation Data 30m
var srtm = ee.Image('USGS/SRTMGL1_003');
var elevation = srtm.select('elevation').clip(bound);

//Map.addLayer(elevation, {}, 'elevation');

var masksrtm = elevation.lte(30);

var maskedsrtm = composite.updateMask(masksrtm);

//Map.addLayer(maskedsrtm, visParams,'maskedsrtm');

var ndwi = maskedsrtm.normalizedDifference(['B5', 'B6']).rename('NDWI');

//Map.addLayer(ndwi, {min:0, max: 0.2},'ndwi');

var mvi = maskedsrtm.expression(
    '(NIR - GREEN)/(SWIR - GREEN)', {
      'NIR': maskedsrtm.select('B4'),
      'GREEN': maskedsrtm.select('B2'),
      'SWIR': maskedsrtm.select('B5')
}).rename('mvi');

var ndvi = composite.normalizedDifference(['B4', 'B3']);

var wcmc = ee.Image('WCMC/biomass_carbon_density/v1_0/2010');

var carbon = wcmc.clip(qc);

var dataset_nasa = ee.ImageCollection("NASA/ORNL/biomass_carbon_density/v1");

var nasa = dataset_nasa.median().clip(qc);

var agb = nasa.select('agb');

var bgb = nasa.select('bgb');

var whrc = ee.Image('WHRC/biomass/tropical');

// Correlation analysis
var randomPoints = ee.FeatureCollection.randomPoints(qc,1000);

Map.addLayer(randomPoints, {color: 'red'}, 'randomPoints');

var features = mvi.addBands(carbon.rename('carbon').addBands(ndvi.rename('ndvi').addBands(ndwi.rename('ndwi').addBands(agb.rename('agb').addBands(bgb.rename('bgb').addBands(whrc.rename('whrc')))))))
  .reduceRegions(randomPoints, ee.Reducer.mean(), 1000);
  
var r2 = ee.Number(features.reduceColumns(ee.Reducer.pearsonsCorrelation(), ['carbon', 'mvi']).get('correlation')).pow(2);

print('r2 = ', r2);

print(ui.Chart.feature.byFeature({
  features: features, 
  xProperty: 'mvi', 
  yProperties: ['carbon']
}).setOptions({
  title: "mvi vs. carbon ",
  hAxis: {title: 'mvi'},
  vAxis: {title: 'carbon (C)'},
  colors: ['#EF851C'],
  pointSize: 3,
  lineWidth: 0,
  trendlines: { 
    0: { 
      type: 'linear', 
      visibleInLegend: true,
      color: 'black',
      opacity: 1,
      lineWidth: 2,
      pointSize: 0,
      showR2: true
    } 
  }  
}));
 

var r2a = ee.Number(features.reduceColumns(ee.Reducer.pearsonsCorrelation(), ['carbon', 'ndvi']).get('correlation')).pow(2);

print('r2a = ', r2a);
  

print(ui.Chart.feature.byFeature({
  features: features, 
  xProperty: 'ndvi', 
  yProperties: ['carbon']
}).setOptions({
  title: "ndvi vs. carbon ",
  hAxis: {title: 'ndvi'},
  vAxis: {title: 'carbon (C)'},
  colors: ['#EF851C'],
  pointSize: 3,
  lineWidth: 0,
  trendlines: { 
    0: { 
      type: 'linear', 
      visibleInLegend: true,
      color: 'black',
      opacity: 1,
      lineWidth: 2,
      pointSize: 0,
      showR2: true
    } 
  }  
}));

var r2b = ee.Number(features.reduceColumns(ee.Reducer.pearsonsCorrelation(), ['carbon', 'ndwi']).get('correlation')).pow(2);

print('r2b = ', r2b);
  

print(ui.Chart.feature.byFeature({
  features: features, 
  xProperty: 'ndwi', 
  yProperties: ['carbon']
}).setOptions({
  title: "ndwi vs. carbon ",
  hAxis: {title: 'ndwi'},
  vAxis: {title: 'carbon (C)'},
  colors: ['#EF851C'],
  pointSize: 3,
  lineWidth: 0,
  trendlines: { 
    0: { 
      type: 'linear', 
      visibleInLegend: true,
      color: 'black',
      opacity: 1,
      lineWidth: 2,
      pointSize: 0,
      showR2: true
    } 
  }  
}));

var r2c = ee.Number(features.reduceColumns(ee.Reducer.pearsonsCorrelation(), ['agb', 'mvi']).get('correlation')).pow(2);

print('r2c = ', r2c);
  

print(ui.Chart.feature.byFeature({
  features: features, 
  xProperty: 'mvi', 
  yProperties: ['agb']
}).setOptions({
  title: "mvi vs. agb ",
  hAxis: {title: 'mvi'},
  vAxis: {title: 'agb (C)'},
  colors: ['#EF851C'],
  pointSize: 3,
  lineWidth: 0,
  trendlines: { 
    0: { 
      type: 'linear', 
      visibleInLegend: true,
      color: 'black',
      opacity: 1,
      lineWidth: 2,
      pointSize: 0,
      showR2: true
    } 
  }  
}));

var r2d = ee.Number(features.reduceColumns(ee.Reducer.pearsonsCorrelation(), ['agb', 'ndvi']).get('correlation')).pow(2);

print('r2d = ', r2d);
  

print(ui.Chart.feature.byFeature({
  features: features, 
  xProperty: 'ndvi', 
  yProperties: ['agb']
}).setOptions({
  title: "ndvi vs. agb ",
  hAxis: {title: 'ndvi'},
  vAxis: {title: 'agb (C)'},
  colors: ['#EF851C'],
  pointSize: 3,
  lineWidth: 0,
  trendlines: { 
    0: { 
      type: 'linear', 
      visibleInLegend: true,
      color: 'black',
      opacity: 1,
      lineWidth: 2,
      pointSize: 0,
      showR2: true
    } 
  }  
}));

var r2e = ee.Number(features.reduceColumns(ee.Reducer.pearsonsCorrelation(), ['bgb', 'mvi']).get('correlation')).pow(2);

print('r2e = ', r2e);
  
print(ui.Chart.feature.byFeature({
  features: features, 
  xProperty: 'mvi', 
  yProperties: ['bgb']
}).setOptions({
  title: "mvi vs. bgb ",
  hAxis: {title: 'mvi'},
  vAxis: {title: 'bgb (C)'},
  colors: ['#EF851C'],
  pointSize: 3,
  lineWidth: 0,
  trendlines: { 
    0: { 
      type: 'linear', 
      visibleInLegend: true,
      color: 'black',
      opacity: 1,
      lineWidth: 2,
      pointSize: 0,
      showR2: true
    } 
  }  
}));

var r2f = ee.Number(features.reduceColumns(ee.Reducer.pearsonsCorrelation(), ['bgb', 'ndvi']).get('correlation')).pow(2);

print('r2f = ', r2f);
  
print(ui.Chart.feature.byFeature({
  features: features, 
  xProperty: 'ndvi', 
  yProperties: ['bgb']
}).setOptions({
  title: "ndvi vs. bgb ",
  hAxis: {title: 'ndvi'},
  vAxis: {title: 'bgb (C)'},
  colors: ['#EF851C'],
  pointSize: 3,
  lineWidth: 0,
  trendlines: { 
    0: { 
      type: 'linear', 
      visibleInLegend: true,
      color: 'black',
      opacity: 1,
      lineWidth: 2,
      pointSize: 0,
      showR2: true
    } 
  }  
}));

var r2g = ee.Number(features.reduceColumns(ee.Reducer.pearsonsCorrelation(), ['whrc', 'mvi']).get('correlation')).pow(2);

print('r2g = ', r2g);
  
print(ui.Chart.feature.byFeature({
  features: features, 
  xProperty: 'mvi', 
  yProperties: ['whrc']
}).setOptions({
  title: "mvi vs. whrc ",
  hAxis: {title: 'mvi'},
  vAxis: {title: 'whrc (Mg C)'},
  colors: ['#EF851C'],
  pointSize: 3,
  lineWidth: 0,
  trendlines: { 
    0: { 
      type: 'linear', 
      visibleInLegend: true,
      color: 'black',
      opacity: 1,
      lineWidth: 2,
      pointSize: 0,
      showR2: true
    } 
  }  
}));

var r2h = ee.Number(features.reduceColumns(ee.Reducer.pearsonsCorrelation(), ['whrc', 'ndvi']).get('correlation')).pow(2);

print('r2h = ', r2h);
  
print(ui.Chart.feature.byFeature({
  features: features, 
  xProperty: 'ndvi', 
  yProperties: ['whrc']
}).setOptions({
  title: "ndvi vs. whrc ",
  hAxis: {title: 'ndvi'},
  vAxis: {title: 'whrc (Mg C)'},
  colors: ['#EF851C'],
  pointSize: 3,
  lineWidth: 0,
  trendlines: { 
    0: { 
      type: 'linear', 
      visibleInLegend: true,
      color: 'black',
      opacity: 1,
      lineWidth: 2,
      pointSize: 0,
      showR2: true
    } 
  }  
}));
