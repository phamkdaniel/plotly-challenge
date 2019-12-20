var sampleMetadata = d3.select('#sample-metadata');
var selDataset = d3.select('#selDataset');

var data = d3.json("./static/samples.json");
var i;


// build select options
data.then(function(json) {
    var names = json.names;

    selDataset.selectAll("option")
     .data(names)
     .enter()
     .append("option")
     .text(function(d) {
         return d;
     })
     .attr("value", function(d) {
         return d;
     });
});

// initialize first data
function init() {
    // initialize blank plot
    var barTrace = {
        type: 'bar',
        orientation: 'h'
    };

    var bubbleTrace = {
        mode: 'markers',
    };

    var gaugeTrace = {
        title: {text: 'Belly Button Washing Frequency'},
        domain: { x: [0, 1], y: [0, 1] },
		type: "indicator",
        mode: "gauge",
        gauge: {
            axis: {range: [0, 9]},
            steps: [
                {range: [0, 1], color: 'red'},
                {range: [1, 2], color: 'orange'},
                {range: [2, 3], color: 'yellow'},
                {range: [3, 4], color: 'lime'},
                {range: [4, 5], color: 'blue'},
                {range: [5, 6], color: 'indigo'},
                {range: [6, 7], color: 'violet'},
                {range: [7, 8], color: 'brown'},
                {range: [8, 9], color: 'black'}
            ]
        }
    };

    Plotly.newPlot('bar', [barTrace]);
    Plotly.newPlot('bubble', [bubbleTrace]);
    Plotly.newPlot('gauge', [gaugeTrace]);

    // update plot with initial value
    data.then(function(json) {
        var initVal = json.names[0];
        updateData(initVal);
    });
};

function optionChanged (val) {
    updateData(val);
};

function updateData(val) {
    data.then(function(json) {
        // update metadata
        var meta = json.metadata;
        var filterMeta = meta.filter(e => e.id == val)[0];
        sampleMetadata.html(
            `<p>id: ${filterMeta.id}
            <br>ethnicity: ${filterMeta.ethnicity}
            <br>gender: ${filterMeta.gender}
            <br>age: ${filterMeta.age}
            <br>location: ${filterMeta.location}
            <br>bbtype: ${filterMeta.bbtype}
            <br>wfreq: ${filterMeta.wfreq}</p>`
        );

        // update bar
        var sampleData = json.samples;
        var filterData = sampleData.filter(e => e.id == val)[0];

        sampleArray = []
        for (i=0; i<filterData.sample_values.length; i++) {
            var sample = {
                otu_id: filterData.otu_ids[i],
                otu_label: filterData.otu_labels[i],
                sample_value: filterData.sample_values[i]
            };
            sampleArray.push(sample);
        };

        topTen = sampleArray.sort(function(a,b) {
            return b.sample_value - a.sample_value;
        }).slice(0,10);
        topTen.reverse();

        var barData = {
            x: [topTen.map(e => e.sample_value)],
            y: [topTen.map(e => `OTU ${e.otu_id}`)],
            text: filterData.otu_labels,
        };
        Plotly.restyle('bar', barData);

        // update bubble
        var bubbleData = {
            x: [filterData.otu_ids],
            y: [filterData.sample_values],
            marker: {
                color: filterData.otu_ids,
                size: filterData.sample_values
            },
            text: filterData.otu_labels
        };
        Plotly.restyle('bubble', bubbleData);

        var gaugeData = {
            value: filterMeta.wfreq
        };
        Plotly.restyle('gauge', gaugeData);
    });
};

init();
