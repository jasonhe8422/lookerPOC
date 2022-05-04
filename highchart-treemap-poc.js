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
  options: {
    sort_by_value: {
      type: "boolean",
      label: "Sort By Value",
      default: false
    }
  },
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
    // Clear any errors from previous updates.
    this.clearErrors();
    console.log("config: ");
    console.log(JSON.stringify(config));
    console.log("queryResponse: ");
    console.log(JSON.stringify(queryResponse));
    console.log("data: ");
    console.log(JSON.stringify(data));
    element.style.height = "100%";

    let containerId = "container:" + new Date().getTime();
    element.id = containerId;
    this.drawChart(containerId)
    doneRendering()
  },


  generateNormalHighChartLine: function (queryResponse, data, config, containerId) {
    let measureName = queryResponse.fields.measures[0].name;
    let dimensionName = queryResponse.fields.dimensions[0].name;
    const convertedData = this.convertData(dimensionName, measureName, data, config);
    console.log("----------------Converted Data------------------------")
    console.log(JSON.stringify(convertedData));
    this.drawChart(containerId, convertedData, config);
  },

  convertData: function (dimensionFieldName, measureFieldName, data, config) {
    if (config.sort_by_value) {
      data = data.filter(item => item[measureFieldName].value).sort((a, b) => {
        if (a[measureFieldName].value < b[measureFieldName].value) {
          return -1;
        } else if (a[measureFieldName].value > b[measureFieldName].value) {
          return 1;
        } else {
          return 0;
        }
      })
    }
    const convertedData = data.filter(item => item[measureFieldName].value).map((item, index) => {
      const value = item[measureFieldName].value;
      const name = item[dimensionFieldName].value;
      return {
        name: name,
        value: value,
        colorValue: index + 1
      };
    });
    return convertedData;
  },

  drawChart: function (containerId, data, xLabel, yLabel, config) {
    Highcharts.chart(containerId, {
      colorAxis: {
        minColor: '#FFFFFF',
        maxColor: Highcharts.getOptions().colors[0]
      },
      series: [{
        type: 'treemap',
        layoutAlgorithm: 'squarified',
        data: [{
          name: 'A',
          value: 6,
          colorValue: 1
        }, {
          name: 'B',
          value: 6,
          colorValue: 2
        }, {
          name: 'C',
          value: 4,
          colorValue: 3
        }, {
          name: 'D',
          value: 3,
          colorValue: 4
        }, {
          name: 'E',
          value: 2,
          colorValue: 5
        }, {
          name: 'F',
          value: 2,
          colorValue: 6
        }, {
          name: 'G',
          value: 1,
          colorValue: 7
        }]
      }],
      title: {
        text: 'Highcharts Treemap'
      }
    });
  },


  formatMoney: function (number, places, symbol, thousand, decimal) {
    number = number || 0;
    places = !isNaN(places = Math.abs(places)) ? places : 2;
    symbol = symbol !== undefined ? symbol : "$";
    thousand = thousand || ",";
    decimal = decimal || ".";
    let negative = number < 0 ? "-" : "";
    let i = parseInt(number = Math.abs(+number || 0).toFixed(places), 10) + "";
    let j = i.length;
    j = j > 3 ? j % 3 : 0;
    return symbol + negative + (j ? i.substr(0, j) + thousand : "") +
      i.substr(j).replace(/(\d{3})(?=\d)/g, "$1" + thousand) + (places ? decimal +
        Math.abs(number - i).toFixed(places).slice(2) : "");
  },

  round: function (numberRound, roundDigit) {
    if (numberRound >= 0) {
      var tempNumber = parseInt((numberRound * Math.pow(10, roundDigit) + 0.5)) / Math.pow(10, roundDigit);
      return tempNumber;
    } else {
      numberRound1 = -numberRound;
      var tempNumber = parseInt((numberRound1 * Math.pow(10, roundDigit) + 0.5)) / Math.pow(10, roundDigit);
      return -tempNumber;
    }
  }

};

looker.plugins.visualizations.add(visObject);

function add0(m) {
  return m < 10 ? '0' + m : m
}




