
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

var ndvimask = ndvi.gt(0);
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

print('Total carbon: ', tc, 'Megagram');

var market = 20;

var currency = 'USD';

var price = tc.multiply(market);

print('Total carbon value: ', price, currency);
