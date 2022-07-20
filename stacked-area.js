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
    console.log("config: ");
    console.log(JSON.stringify(config));
    console.log("queryResponse: ");
    console.log(JSON.stringify(queryResponse));
    console.log("data: ");
    console.log(JSON.stringify(data));
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
    element.className = "vis_container";
    const drillIntoDiv = document.createElement("div");
    drillIntoDiv.id = "drillInto-" + new Date().getTime();
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
      console.error("not support data containing table_calculations")
      // this.generateCalculationHighChartLine(queryResponse, data, config, containerId, drillIntoDiv);
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
     console.log("----------------Converted Data------------------------")
     console.log(JSON.stringify(convertedData));
    const measureLabelName = config.custom_y_axis_name || queryResponse.fields.measures[0].label_short || queryResponse.fields.measures[0].label;
    console.log(config.custom_y_axis_name +" - "+queryResponse.fields.measures[0].label_short+" - "+queryResponse.fields.measures[0].label);
    const dimensionLabelName = config.custom_x_axis_name || queryResponse.fields.dimensions[0].label_short || queryResponse.fields.dimensions[0].label;
    console.log(config.custom_x_axis_name +" - "+queryResponse.fields.dimensions[0].label_short+" - "+queryResponse.fields.dimensions[0].label);
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
    const convertedData = data.filter(item => this.findPathByLeafId('value', item[yFieldName])).map(item => {
      let subLinks = [];
      subLinks = subLinks.concat(item[xFieldName].links ? item[xFieldName].links : []);
      subLinks = subLinks.concat(item[yFieldName].links ? item[yFieldName].links : []);
      links.push(subLinks);
      const date = item[xFieldName].value;
      const yValue = this.findPathByLeafId('value', item[yFieldName])
      const mktValue = percentage ? yValue * 100 : yValue;
      return [date, this.round(mktValue, config.decimals)];
    });
    return {
      "convertedData": convertedData,
      "links": links
    };
  },

  findPathByLeafId: function (leafId, node) {
    for(let name in node){
      if(name === leafId){
        return node[leafId]
      }else if(typeof node[name] === 'object'){
        return this.findPathByLeafId(leafId, node[name])
      }else{
        return node[leafId]
      }
    }
  },

  drawChart: function (containerId, drillIntoDiv, data, xLabel, yLabel, config) {
    console.log('xTitle: '+xLabel);
    console.log('yTitle: '+yLabel);
    const visObjectThis = this;
    const xTitle = config.display_x_axis_title ? xLabel || "" : "";
    const yTitle = config.display_y_axis_title ? yLabel || "" : "";
    const xValues = data.convertedData.map(item => item[0]);
    const yValues = data.convertedData.map(item => item[1]);
    Highcharts.chart(containerId, {
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
        type: 'area',
        style: {
          height: "100%"
        }
      },
      title: {
        text: '',
        margin: 0,
        style: { "color": "#333333", "fontSize": "1px" }
      },
      xAxis: {
        categories: xValues,
        tickmarkPlacement: 'on',
        title: {
          enabled: false,
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
        area: {
          stacking: 'normal',
          lineColor: '#666666',
          lineWidth: 1,
          marker: {
            lineWidth: 1,
            lineColor: '#666666'
          }
        },
        series: {
          cursor: 'pointer',
          events: {
            click: function (event) {
              const drillLinks = data.links[event.point.index].map(item => {
                return {
                  "label": item.label,
                  "type": item.type,
                  "type_label": "Drill into " + visObjectThis.dateformat(event.point.options.x, config.date_format),
                  "url": item.url
                };
              })
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
      series: [{
        name: 'xLabel',
        data: [3628666.61,3629397.76,3575683.24,3574181.08,3574989.81,3564704.84,3609157.01,3634422.58,3592183.36,3591426.51,3532855.78,3517310.51,3498895.79,3444547.17,3432384.26,3406793.46,3390052.12,3368696.23,3415934.6,3482984.31,3506937.67,4472779.16,4427038.75,4437503.93,4430789.5,4908119.14,4957786.01,4907515.71,4840077.48,4810407.16,4879084.54,4890668.31,4828545.79,4808862.92,4763339.44,4753763.46,4737548.81,4874404.92,4851588.72,4945060.63,4994575.59,4952898.22,4885640.05,4770394.98,4752792.92,4864082.05,4819215.43,4777197.98,4738906.29,4785031.4,4931618.54,4968068.31,5012733.49,4993445.59,5039391.59,4998426.01,5033629.03,5036168.98,5515164.16,5595567.37,5580332.99,5517601.74,5533997.48,5579684.28,5513613.6,5452102.4,5474962.11,5479660.53,5413126.41,5402973.9,5443852.8,5398925.35,5510485.63,5534138.79,5543399.1,5485688.6,5382072.34,5367924.34,5271895.16,5287041.29,5354167.38,5283066.51,5284235.24,5302245.97,5372717.3,5244350.33,5201970.47,5069917.72,5078699.2,5054694.75,5031044.73,5133406.4,5125033.67,5173926.44,5084518.29,5072774.12,5060207.01,5140215.65,5077670.25,5124044.04,5204043.04,5276341.58,5277507.3,5237735.39,5276040.55,5239947.61,5276234.6,5276928.69,5284732.8,5197633.97,5054729.01,4895824.87,4882009.54,4925469.78,4819525.76,4819993.83,4906955.68]
      }],
      tooltip: {
        split: true,
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


