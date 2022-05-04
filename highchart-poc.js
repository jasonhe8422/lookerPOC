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
    display_style: {
      type: "string",
      label: "Display Style",
      display: "radio",
      values: [{"US":"US"},{"CL":"CL"}]
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
     element.innerHTML = `
      <style>
        .tooltipdiv{
          font-family: "Open Sans",Helvetica,Arial,sans-serif;
          font-size: 100px;
          pointer-events: none;
          overflow: none;
          white-space: nowrap;
        }
      </style>
    `;
		let container = document.createElement("div");
		element.appendChild(container);
    

    // Throw some errors and exit if the shape of the data isn't what this chart needs.
    if (!queryResponse.fields.dimensions || queryResponse.fields.dimensions.length == 0) {
      console.error("This chart requires dimensions.");
      this.addError({title: "No Dimensions", message: "This chart requires dimensions."});
      return;
    }
    if (!queryResponse.fields.measures || queryResponse.fields.measures.length == 0) {
      console.error("This chart requires measures.");
      this.addError({title: "No Dimensions", message: "This chart requires measures."});
      return;
    }
    let containerId = "container:" + new Date().getTime();
    container.id = containerId;
    let measureName = queryResponse.fields.measures[0].name;
    let dimensionName = queryResponse.fields.dimensions[0].name;
    const convertedData = data.map(item => {
      const date = new Date(item[dimensionName].value).getTime();
      const mktValue = item[measureName].value;
      return [date, mktValue];
    });
    // console.log("----------------Converted Data------------------------")
    // console.log(JSON.stringify(convertedData));
    const measureLabelName = queryResponse.fields.measures[0].label_short;
    const dimensionLabelName = queryResponse.fields.dimensions[0].label_short;
    const visObjectThis = this;

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

      tooltip: {
        className: "tooltipdiv",
        backgroundColor: "#262D33",
        style: {
          color: 'white'
        },
        borderWidth: 0,
        shadow: false,
        useHTML: true,
        formatter: function() {
          const date = visObjectThis.dateformat(this.x);
          const amount = visObjectThis.formatMoney(this.y,2,'');
          return '<div style="height:20px">'+dimensionLabelName + '</div><div style="height:30px"><b>' + date + '</b></div><div style="height:20px">'+
            measureLabelName + '</div><div><b>' + amount+'</b></div>';
        }
      },

      series: [{
        data: convertedData

      }]
    });

    doneRendering()
  },

  dateformat: function (timestamp)
  {
    const time = new Date(timestamp);
    let y = time.getFullYear();
    let m = time.getMonth()+1;
    let d = time.getDate();
    return y+'-'+add0(m)+'-'+add0(d);
  },

  dateTimeFormat: function (timestamp)
  {
    const time = new Date(timestamp);
    let y = time.getFullYear();
    let m = time.getMonth()+1;
    let d = time.getDate();
    let h = time.getHours();
    let mm = time.getMinutes();
    let s = time.getSeconds();
    return y+'-'+add0(m)+'-'+add0(d)+' '+add0(h)+':'+add0(mm)+':'+add0(s);
  },


  formatMoney: function (number, places, symbol, thousand, decimal){
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
  }

};

looker.plugins.visualizations.add(visObject);

function add0 (m){return m<10?'0'+m:m }




