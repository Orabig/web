/**
*   Dashboard Graph:  
*               Sends request to API (images per hour for the last x days)
*               Chartjs is used to render the information to a graph. 
**/

define(["jquery", "chartjs"], function($, Chart)
{
    return {
        initialize: function(config)
        {
            this_ = this;
            this_.config = config;
            
            $.get(this_.config.url,function(data)
            {
               this_.draw(data);
            })
            .always(function()
            {
                // Wait 300 ms before executing 
                setTimeout(this_.config.callback, 300);
            });
        },
        draw: function(data)
        {
            var canvas = $("#time-chart").get(0);
            var ctx = canvas.getContext("2d");

            var dayStyle = [
                {
                    label: "Today", // Red
                    fillColor: "rgba(148,54,51,0)",
                    strokeColor: "#943633",
                    pointColor: "#943633",
                    pointStrokeColor: "#fff",
                    pointHighlightFill: "#fff",
                    pointHighlightStroke: "#943633",
                },
                {
                    label: "Yesterday", // Dark gray
                    fillColor: "rgba(120,120,120,0)",
                    strokeColor: "rgba(120,120,120,1)",
                    pointColor: "rgba(120,120,120,1)",
                    pointStrokeColor: "#fff",
                    pointHighlightFill: "#fff",
                    pointHighlightStroke: "rgba(120,120,120,1)",
                },
                {
                    label: "Ereyesterday", // Light gray
                    fillColor: "rgba(220,220,220,0)",
                    strokeColor: "rgba(220,220,220,1)",
                    pointColor: "rgba(220,220,220,1)",
                    pointStrokeColor: "#fff",
                    pointHighlightFill: "#fff",
                    pointHighlightStroke: "rgba(220,220,220,1)",
                },
            ];

            var averageStyle = {
                label: "Average", // Green
                fillColor: "rgba(76,156,56,0)",
                strokeColor: "#4C9C38",
                pointColor: "#4C9C38",
                pointStrokeColor: "#fff",
                pointHighlightFill: "#fff",
                pointHighlightStroke: "#4C9C38",
            };
 
            var steps = 10;
            var max = 0;

            // ---------------------
            // Build statistics

            var statistics = {};
            statistics['labels'] = [];
            for(var i = 0; i < 24; i++)
            {
                statistics['labels'].push(i + 'h');
            }
            statistics['datasets'] = [];

            if(data && data.days && data.days.length > 0)
            {
                // ---------------------
                // Add averages images

                var average = data["statistics"]["average"];
                if(average)
                {
                    dataset = averageStyle;
                    dataset['data'] = average;
                    statistics['datasets'].push(dataset);
                }

                // ----------
                // Add days

                var days = data["days"];
                for(var i = 0; i < days.length; i++)
                {
                    var dataset = dayStyle[i % dayStyle.length];
                    dataset['data'] = days[i];
                    statistics['datasets'].push(dataset);

                    for(var j = 0; j < days[i].length; j++)
                    {
                        if(max < days[i][j]) max = days[i][j];
                    }
                }
            }

            var options = {
                datasetStrokeWidth : 2,
                responsive: true,
                scaleOverride: true,
                scaleSteps: steps,
                scaleStepWidth: Math.ceil(max / steps),
                scaleStartValue: 0,
                multiTooltipTemplate: "<%= datasetLabel %> - <%= value %>"
            };

            // ----------------------------------------------------------------
            // This will get the first returned node in the jQuery collection.

            if(statistics['datasets'] && statistics['datasets'].length > 0)
            {
                var timeChart = new Chart(ctx).Line(statistics, options);
            }
            else
            {
                var x = canvas.width / 2;
                var y = canvas.height / 2;
                ctx.font = '20px Arial';
                ctx.textAlign = 'center';
                ctx.fillStyle = 'black';
                ctx.fillText('No data available', x, y);
            }
        }
    };
});