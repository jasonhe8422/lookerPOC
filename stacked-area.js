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
    areaColor: {
      section: "Data",
      type: "array",
      display: "colors",
      label: "Color Palette",
      default: ["#424D5E", "#6A334C", "#A8D8F2", "#83889D", "#AC8999", "#C3CDE9", "#617D8C", "#A74D4D", "#2F4B9B", "#B7A5AD", "#F2A8A8", "#9889AC"]
    },
    // sort_by_x: {
    //   section: "Data",
    //   type: "boolean",
    //   label: "Sort By X Axis",
    //   default: false
    // },
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
    y_axis_label_format:{
      section: "Y",
      type: "string",
      label: "Y Axis Format",
      default: "$ 0.00,, \"M\""
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
    // console.log("detail: ");
    // console.log(JSON.stringify(details));
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
    let links = {};


    const convertedData = data.map(item => {
      let subLinks = {};
      subLinks.default = item[xFieldName].links ? item[xFieldName].links : [];
      const date = item[xFieldName].value;
      const yValues = {};
      for(let subValue in item[yFieldName]){
        const subObj = item[yFieldName][subValue];
        if(subObj && typeof subObj === 'object'){
          subLinks[subValue] = subObj.links ? subObj.links : [];
          let yValue = this.findPathByLeafId('value', subObj);
          yValue = yValue ? yValue : 0;
          const mktValue = percentage ? yValue * 100 : yValue;
          yValues[subValue] = mktValue;
        }
      }
      return [date, yValues, subLinks];
    });

    // const convertedData = data.filter(item => this.findPathByLeafId('value', item[yFieldName])).map(item => {
    //   let subLinks = [];
    //   subLinks = subLinks.concat(item[xFieldName].links ? item[xFieldName].links : []);
    //   subLinks = subLinks.concat(item[yFieldName].links ? item[yFieldName].links : []);
    //   links.push(subLinks);
    //   const date = item[xFieldName].value;
    //   const yValue = this.findPathByLeafId('value', item[yFieldName])
    //   const mktValue = percentage ? yValue * 100 : yValue;
    //   return [date, this.round(mktValue, config.decimals)];
    // });
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
    console.log("drawChart: ");
    console.log(config.areaColor);
    const visObjectThis = this;
    const xTitle = config.display_x_axis_title ? xLabel || "" : "";
    const yTitle = config.display_y_axis_title ? yLabel || "" : "";
    data.convertedData = data.convertedData.filter(item => {
      item = item[1];
      for(let name in item){
        if(item[name] != 0){
          return true;
        }
      }
      return false;
    })
    const xValues = data.convertedData.map(item => item[0]);
    const yValueObj = {};
    data.convertedData.map(item => item[1]).map(item => {
      for(let name in item){
        if(!yValueObj[name]){
          yValueObj[name] = [];
        }
        yValueObj[name].push(item[name]);
      }
    })
    const yValues = [];
    const colorSize = config.areaColor.length;
    let count = 0;
    for(let name in yValueObj){
      if(count >= colorSize){
        count = count - colorSize;
      }
      yValues.push({name: name, data: yValueObj[name], color: config.areaColor[count++], marker:{enabled: false}});
    }
    console.log("x value: ");
    console.log(xValues);
    console.log("y value: ");
    console.log(yValues);
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
        labels:{
          formatter: function (){
            return this.value;
          }
        },
        width: config.display_y_axis_title ? "95%" : "100%"
      },
      yAxis: {
        title: {
          text: yTitle
        },
        labels: {
          formatter: function () {
            // const decimals = config.decimals_y_axis_label || 0;
            const format = config.y_axis_label_format.split(' ');
            let formattedValue = this.value;
            const unit = format[2] && format[2].length == 3 && format[2].substring(1,2);
            if(unit === 'S'){
              formattedValue = this.value / 1000;
            }else if(unit === 'M'){
              formattedValue = this.value / 1000000;
            }else if(unit === 'B'){
              formattedValue = this.value / 1000000000;
            }

            //(number, places, symbol, thousand, decimal)
            const thousand = format[1].substring(format[1].indexOf(',')+1);
            const numberFormat = format[1].substring(0, format[1].indexOf(','));
            const decimals = numberFormat.length - (numberFormat.indexOf('.')+1)

            let label = visObjectThis.formatMoney(formattedValue, decimals, format[0], thousand, '.');

            if (config.percentage) {
              return label + "%";
            }
            return label + (unit ? ' '+unit : '');
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
              // console.log(window.top.document.getElementById("looker"))
              // window.top.postMessage("message1","*");
              // window.parent.postMessage("message2","*");
              const seriesName = event.point.series.name;
              const drillLinks = [];
              const linkObj = data.convertedData[event.point.index][2];
              for(let name in linkObj){
                if(name != seriesName && name != 'default'){
                  continue;
                }
                const item = linkObj[name];
                item.forEach(item1 => {
                  let labelName;
                  if(item1.type === 'drill'){
                    labelName = "Drill into " + visObjectThis.dateformat(event.point.category, config.date_format);
                  }else if(item1.type === 'look'){
                    labelName = 'Looks';
                  }else {
                    labelName = 'Explore'
                  }
                  drillLinks.push({"label": item1.label,
                    "type": item1.type,
                    "type_label": labelName,
                    "url": item1.url});
                });
              }

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
      series: yValues,
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
          return [this.x].concat(this.points.map(item => {
            let amount = visObjectThis.formatMoney(item.y, config.decimals, '');
            if (config.percentage) {
              amount = amount + "%";
            }
            return '<div style="height:20px">' +
              item.series.name + '</div><div><b>' + amount + '</b></div>';
          }));
        }
      }
    });
  },

  dateformat: function (timestamp, format) {
    return moment(new Date(timestamp)).format(format);
  },

  formatMoney: function (number, places, symbol, thousand, decimal) {
    number = number || 0;
    places = !isNaN(places = Math.abs(places)) ? places : 2;
    symbol = symbol ? symbol+' ' : "$ ";
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


