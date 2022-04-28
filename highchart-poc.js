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
  create: function(element, config){
   // element.innerHTML = "<h1>Ready to render!</h1>";
  },

  /**
   * UpdateAsync is the function that gets called (potentially) multiple times. It receives
   * the data and should update the visualization with the new data.
   **/
  updateAsync: function(data, element, config, queryResponse, details, doneRendering){
    console.log("----------queryResponse----------");
    console.log(JSON.stringify(queryResponse));
    console.log("----------data------------");
    console.log(JSON.stringify(data));
    let containerId = "container:"+new Date().getTime();
    element.id= containerId;
    Highcharts.chart(containerId, {
      chart: {
        type: 'spline',
        scrollablePlotArea: {
          minWidth: 600,
          scrollPositionX: 1
        }
      },
      title: {
        text: 'Wind speed during two days',
        align: 'left'
      },
      subtitle: {
        text: '13th & 14th of February, 2018 at two locations in Vik i Sogn, Norway',
        align: 'left'
      },
      xAxis: {
        type: 'datetime',
        labels: {
          overflow: 'justify'
        }
      },
      yAxis: {
        title: {
          text: 'Wind speed (m/s)'
        },
        minorGridLineWidth: 0,
        gridLineWidth: 0,
        alternateGridColor: null,
      },
      tooltip: {
        valueSuffix: ' m/s'
      },
      plotOptions: {
        spline: {
          lineWidth: 4,
          states: {
            hover: {
              lineWidth: 5
            }
          },
          marker: {
            enabled: false
          },
          pointInterval: 3600000, // one hour
          pointStart: Date.UTC(2018, 1, 13, 0, 0, 0)
        }
      },
      series: [{
        name: 'Hestavollane',
        data: [
          3.7, 3.3, 3.9, 5.1, 3.5, 3.8, 4.0, 5.0, 6.1, 3.7, 3.3, 6.4,
          6.9, 6.0, 6.8, 4.4, 4.0, 3.8, 5.0, 4.9, 9.2, 9.6, 9.5, 6.3,
          9.5, 10.8, 14.0, 11.5, 10.0, 10.2, 10.3, 9.4, 8.9, 10.6, 10.5, 11.1,
          10.4, 10.7, 11.3, 10.2, 9.6, 10.2, 11.1, 10.8, 13.0, 12.5, 12.5, 11.3,
          10.1
        ]

      }, {
        name: 'Vik',
        data: [
          0.2, 0.1, 0.1, 0.1, 0.3, 0.2, 0.3, 0.1, 0.7, 0.3, 0.2, 0.2,
          0.3, 0.1, 0.3, 0.4, 0.3, 0.2, 0.3, 0.2, 0.4, 0.0, 0.9, 0.3,
          0.7, 1.1, 1.8, 1.2, 1.4, 1.2, 0.9, 0.8, 0.9, 0.2, 0.4, 1.2,
          0.3, 2.3, 1.0, 0.7, 1.0, 0.8, 2.0, 1.2, 1.4, 3.7, 2.1, 2.0,
          1.5
        ]
      }],
      navigation: {
        menuItemStyle: {
          fontSize: '10px'
        }
      }
    });


    doneRendering()
  }
};

looker.plugins.visualizations.add(visObject);
