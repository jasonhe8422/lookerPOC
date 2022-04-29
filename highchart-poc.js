/**
 * Welcome to the Looker Visualization Builder! Please refer to the following resources
 * to help you write your visualization:
 *  - API Documentation - https://github.com/looker/custom_visualizations_v2/blob/master/docs/api_reference.md
 *  - Example Visualizations - https://github.com/looker/custom_visualizations_v2/tree/master/src/examples
 **/

const visObject = {
  /**
   * Configuration options for your visualization. In Looker, these show up in the vis editor
   * panel but here, you can just manually set your default values in the code.
   **/


  /**
   * The create function gets called when the visualization is mounted but before any
   * data is passed to it.
   **/
  create: function (element, config) {
    // element.innerHTML = "<h1>Ready to render!</h1>";
  },

  /**
   * UpdateAsync is the function that gets called (potentially) multiple times. It receives
   * the data and should update the visualization with the new data.
   **/
  updateAsync: function (data, element, config, queryResponse, details, doneRendering) {
    // console.log("----------queryResponse----------");
    // console.log(JSON.stringify(queryResponse));
    // console.log("----------data------------");
    // console.log(JSON.stringify(data));
    let containerId = "container:" + new Date().getTime();
    element.id = containerId;
    let measureName = queryResponse.fields.measures[0].name;
    let dimensionName = queryResponse.fields.dimensions[0].name;
    const convertedData = data.map(item => {
      const date = new Date(item[dimensionName].value).getTime();
      const mktValue = item[measureName].value;
      return [date, mktValue];
    });
    console.log("----------------Converted Data------------------------")
    console.log(JSON.stringify(convertedData));
    Highcharts.stockChart(containerId, {
      credits: {
        enabled: false,
      },
      rangeSelector: {
        enabled:false,
        selected: 1
      },
      navigator:{
        enabled:false,
      },
 

      series: [{
        data: convertedData,
        tooltip: {
          valueDecimals: 2
        }
      }]});

    doneRendering()
  }
};

looker.plugins.visualizations.add(visObject);
