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
    // display_style: {
    //   section: "Plot",
    //   type: "string",
    //   label: "Display Style",
    //   display: "radio",
    //   values: [{"US": "US"}, {"CL": "CL"}]
    // },
    date_format: {
      section: "Plot",
      type: "string",
      label: "Date Format",
      default: "YYYY-MM-DD"
    },
    value_labels: {
      section: "Plot",
      type: "boolean",
      label: "Value Labels",
      default: false
    },
    value_label_color: {
      section: "Plot",
      type: "array",
      display: "color",
      label: "Value Labels Color"
    },
    enable_mouse_tracking: {
      section: "Plot",
      type: "boolean",
      label: "Enable Mouse Tracking",
      default: true
    },
    percentage: {
      section: "Data",
      type: "boolean",
      label: "Percentage(%)",
      default: false
    },
    decimals: {
      section: "Data",
      type: "number",
      label: "Decimals",
      default: 2
    },
    sort_by_x: {
      section: "Data",
      type: "boolean",
      label: "Sort By X Axis",
      default: false
    },
    drill_into: {
      section: "Data",
      type: "string",
      label: "Drill into",
      display: "radio",
      values: [{"X": "X"}, {"Y": "Y"}],
      default: "X"
    },
    custom_x_axis_name: {
      section: "X",
      type: "string",
      label: "Custom Axis Name"
    },
    display_x_axis_title: {
      section: "X",
      type: "boolean",
      label: "Display X Axis title",
      default: true
    },
    custom_y_axis_name: {
      section: "Y",
      type: "string",
      label: "Custom Axis Name"
    },
    display_y_axis_title: {
      section: "Y",
      type: "boolean",
      label: "Display Y Axis title",
      default: true
    },
    decimals_y_axis_label: {
      section: "Y",
      type: "number",
      label: "Decimals"
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
    // console.log("config: ");
    // console.log(JSON.stringify(config));
    // console.log("queryResponse: ");
    // console.log(JSON.stringify(queryResponse));
    // console.log("data: ");
    // console.log(JSON.stringify(data));
    // element.style.innerHTML = defaultTheme;
    // element.innerHTML = `
    //   <style>
    //     .tooltipdiv{
    //       font-family: "Open Sans",Helvetica,Arial,sans-serif;
    //       font-size: 100px;
    //       pointer-events: none;
    //       overflow: none;
    //       white-space: nowrap;
    //     }
    //     .vis_container{
    //         height: 100%
    //     }
    //   </style>
    // `;
    element.style.height = "100%";
    // element.className = "vis_container";
    // const drillIntoDiv = document.createElement("div");
    // drillIntoDiv.id = "drillInto-" + new Date().getTime();
    // element.appendChild(drillIntoDiv);


    // Throw some errors and exit if the shape of the data isn't what this chart needs.
    if (!queryResponse.fields.dimensions || queryResponse.fields.dimensions.length == 0) {
      console.error("This chart requires dimensions.");
      this.addError({title: "No Dimensions", message: "This chart requires dimensions."});
      return;
    }
    let containerId = "container-" + new Date().getTime();
    element.id = containerId;

    const hasTableCalculation = queryResponse.fields.table_calculations && queryResponse.fields.table_calculations.length > 0;
    const hasMeasures = queryResponse.fields.measures && queryResponse.fields.measures.length > 0;
    if (hasTableCalculation) {
      this.generateCalculationHighChartLine(queryResponse, data, config, containerId, drillIntoDiv);
    } else if (hasMeasures) {
      this.generateNormalHighChartLine(queryResponse, data, config, containerId, drillIntoDiv);
    } else {
      console.error("neither table_calculations nor measures can be found in query response.");
      this.addError({
        title: "No table_calculations and measures",
        message: "Neither table_calculations nor measures can be found in query response."
      });
    }
    doneRendering()
  },

  generateCalculationHighChartLine: function (queryResponse, data, config, containerId, drillIntoDiv) {
    const dimensionName = queryResponse.fields.dimensions[0].name;
    const yName = queryResponse.fields.table_calculations[0].name;
    const convertedData = this.convertData(dimensionName, yName, data, config);

    // console.log("convertedData: ");
    // console.log(JSON.stringify(convertedData));
    const dimensionLabel = config.custom_x_axis_name || queryResponse.fields.dimensions[0].label_short || queryResponse.fields.dimensions[0].label;
    const yLabel = config.custom_y_axis_name || queryResponse.fields.table_calculations[0].label_short || queryResponse.fields.table_calculations[0].label;
    this.drawChart(containerId, drillIntoDiv, convertedData, dimensionLabel, yLabel, config);
  },

  generateNormalHighChartLine: function (queryResponse, data, config, containerId, drillIntoDiv) {
    let measureName = queryResponse.fields.measures[0].name;
    let dimensionName = queryResponse.fields.dimensions[0].name;
    const convertedData = this.convertData(dimensionName, measureName, data, config);
    // console.log("----------------Converted Data------------------------")
    // console.log(JSON.stringify(convertedData));
    const measureLabelName = config.custom_y_axis_name || queryResponse.fields.measures[0].label_short || queryResponse.fields.measures[0].label;
    const dimensionLabelName = config.custom_x_axis_name || queryResponse.fields.dimensions[0].label_short || queryResponse.fields.dimensions[0].label;
    this.drawChart(containerId, drillIntoDiv, convertedData, dimensionLabelName, measureLabelName, config);
  },

  convertData: function (xFieldName, yFieldName, data, config) {
    const percentage = config.percentage;
    if (config.sort_by_x) {
      data = data.filter(item => item[xFieldName].value).sort((a, b) => {
        if (a[xFieldName].value < b[xFieldName].value) {
          return -1;
        } else if (a[xFieldName].value > b[xFieldName].value) {
          return 1;
        } else {
          return 0;
        }
      })
    }
    let links = [];
    console.log("drill_indo: " + config.drill_into);
    const convertedData = data.filter(item => item[yFieldName].value).map(item => {
      let drillIntoFieldName = xFieldName;
      if (config.drill_into == 'Y') {
        drillIntoFieldName = yFieldName;
      }
      links.push(item[drillIntoFieldName].links ? item[drillIntoFieldName].links : []);
      const date = new Date(item[xFieldName].value).getTime();
      const mktValue = percentage ? item[yFieldName].value * 100 : item[yFieldName].value;
      return [date, this.round(mktValue, config.decimals)];
    });
    return {
      "convertedData": convertedData,
      "links": links
    };
  },

  drawChart: function (containerId, drillIntoDiv, data, xLabel, yLabel, config) {
    const visObjectThis = this;
    const xTitle = config.display_x_axis_title ? xLabel || "" : "";
    const yTitle = config.display_y_axis_title ? yLabel || "" : "";
    Highcharts.stockChart(containerId, {
      credits: {
        enabled: false,
      },
      exporting: {
        enabled: false,
      },
      rangeSelector: {
        enabled: false,
        selected: 1
      },
      navigator: {
        enabled: false,
      },
      scrollbar: {
        enabled: false
      },
      chart: {
        style: {
          height: "100%"
        }
      },
      xAxis: {
        title: {
          text: xTitle
        },
        width: config.display_y_axis_title ? "95%" : "100%",
      },
      yAxis: {
        title: {
          text: yTitle
        },
        labels: {
          formatter: function () {
            const decimals = config.decimals_y_axis_label || 0;
            let label = visObjectThis.formatMoney(this.value, decimals, '');
            if (config.percentage) {
              return label + "%";
            }
            return label;
          }
        }
      },
      plotOptions: {
        line: {
          dataLabels: {
            enabled: config.value_labels,
            color: config.value_label_color,
            formatter: function () {
              const label = visObjectThis.formatMoney(this.y, config.decimals, '');
              if (config.percentage) {
                return label + "%";
              }
              return label;
            }
          },
          enableMouseTracking: config.enable_mouse_tracking
        },
        series: {
          cursor: 'pointer',
          events: {
            click: function (event) {
              console.log("0000");
              drillIntoDiv.innerHTML = "";
              const drillLinks = data.links[event.point.index].map(item => {
                return {
                  "label": item.label,
                  "type": item.type,
                  "type_label": "Drill into " + visObjectThis.dateformat(event.point.options.x, config.date_format),
                  "url": item.url
                };
              })
              console.log(drillLinks.length);
              if (drillLinks.length > 0) {
                LookerCharts.Utils.openDrillMenu({
                  links: drillLinks,
                  event: event
                });
              }
            }
          }
        }
      },
      tooltip: {
        // className: "tooltipdiv",
        backgroundColor: "#262D33",
        style: {
          color: 'white'
        },
        borderWidth: 0,
        shadow: false,
        useHTML: true,
        formatter: function () {
          const date = visObjectThis.dateformat(this.x, config.date_format);
          let amount = visObjectThis.formatMoney(this.y, config.decimals, '');
          if (config.percentage) {
            amount = amount + "%";
          }
          return '<div style="height:20px">' + xLabel + '</div><div style="height:30px"><b>' + date + '</b></div><div style="height:20px">' +
            yLabel + '</div><div><b>' + amount + '</b></div>';
        }
      },

      series: [{
        data: data.convertedData

      }]
    });
  },

  dateformat: function (timestamp, format) {
    return moment(new Date(timestamp)).format(format);
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



