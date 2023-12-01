class PapersVis{

    constructor(_parentElement, _papersdata){
        this.parentElement = _parentElement;
        this.data = _papersdata;
        this.displayData = [];

        // call method initVis
        this.initVis();
    }

    initVis(){
        let vis = this;


        // define margins
        vis.margin = {top: 20, right: 20, bottom: 20, left: 20};
        vis.width = document.getElementById(vis.parentElement).getBoundingClientRect().width - vis.margin.left - vis.margin.right;
        vis.height = document.getElementById(vis.parentElement).getBoundingClientRect().height - vis.margin.top - vis.margin.bottom;

        // init drawing area
        vis.svg = d3.select(`#${vis.parentElement}`)
            .append("svg")
            .attr("width", vis.width)
            .attr("height", vis.height)
            .append("g")
            .attr('transform', `translate (${vis.margin.left}, ${vis.margin.top})`);

        //Tooltip
        this.tooltipHover = d3.select("body").append("div")
            .attr("class", "tooltip hover-tooltip")
            .style("opacity", 0);

        this.tooltipClick = d3.select("body").append("div")
            .attr("class", "tooltip click-tooltip")
            .style("opacity", 0);

        vis.wrangleData();
    }

    wrangleData(){
        let vis = this;

        vis.displayData = vis.data;

        console.log('here is papers data', vis.displayData);

        vis.updateVis();
    }

    updateVis() {
        let vis = this;

        // Define the keywords and corresponding colors
        const keywords = {
            "Music": "pink",
            "Personality": "blue",
            "Social": "yellow",
            "Technology": "green",
            "Psychology": "orange",
            "Sciences": "brown",
        };


        // Sort the data by publish year
        vis.displayData.sort((a, b) => a["Publish Year"] - b["Publish Year"]);

        let buffer = 50;

        // Set up scales
        // X scale for years
        const xScale = d3.scaleLinear()
            .domain(d3.extent(vis.displayData, d => d["Publish Year"]))
            .range([buffer, vis.width - buffer]);

        // Y scale - static or based on another variable if needed
        const yScale = d3.scaleLinear()
            .range([vis.height, 0]);

        // Radius scale for author number
        const radiusScale = d3.scaleSqrt()
            .domain(d3.extent(vis.displayData, d => d["Author number"]))
            .range([1, 15]); // adjust min and max radius as needed

        // Map to track the y-offset for each year
        const yearOffsets = {};

        // Draw circles
        vis.displayData.forEach(paper => {
            // Initialize the y-offset for this year if it hasn't been already
            if (!yearOffsets[paper["Publish Year"]]) {
                yearOffsets[paper["Publish Year"]] = 0;
            }

            // Get an array of keywords for this paper
            let paperKeywords = paper.Keywords.split(", ");

            // Calculate the y position based on the current offset for this year
            const baseYPosition = vis.height / 6;
            const yPosition = baseYPosition + yearOffsets[paper["Publish Year"]];

            // Draw a circle for each keyword
            paperKeywords.forEach((keyword, index) => {
                if (keywords[keyword]) {
                    vis.svg.append("circle")
                        .attr("class", "paper-circle")
                        .attr("cx", xScale(paper["Publish Year"]))
                        .attr("cy", yPosition)
                        .attr("r", radiusScale(paper["Author number"]) + index * radiusScale(paper["Author number"]) / 2)
                        .style("fill", index === 0 ? keywords[keyword] : "none")
                        .style("stroke", keywords[keyword])
                        .style("stroke-width", 5)
                        .style("opacity", 0.7)
                        .datum(paper);
                }
            });

            // Increment the y-offset for the next paper in this year
            yearOffsets[paper["Publish Year"]] += paperKeywords.length * radiusScale(paper["Author number"]);

            // add some additional spacing between papers
            yearOffsets[paper["Publish Year"]] += 30; // This is the additional spacing
        });


        // Tooltip event handlers
        vis.svg.selectAll('.paper-circle')
            .on("mouseover", function(event, d) {
                // Console log the title for debugging
                console.log("Hovering over: ", d["Title"]);

                vis.tooltipHover.transition()
                    .duration(200)
                    .style("opacity", 0.9);
                vis.tooltipHover.html(d["Title"])
                    .style("left", (event.pageX) + "px")
                    .style("top", (event.pageY - 28) + "px");
            })
            .on("mouseout", function(d) {
                vis.tooltipHover.transition()
                    .duration(500)
                    .style("opacity", 0);
            })
            .on("click", function(event, d) {
                vis.tooltipClick.transition()
                    .duration(200)
                    .style("opacity", 0.9);
                vis.tooltipClick.html(
                    `Title: ${d["Title"]}<br/>` +
                    `Authors: ${d["Author"]}<br/>` +
                    `Year: ${d["Publish Year"]}<br/>` +
                    `Keywords: ${d["Keywords"]}`
                )
                    .style("left", (event.pageX) + "px")
                    .style("top", (event.pageY - 28) + "px");
            });

        // Calculate the number of ticks based on the range of years
        const yearRange = d3.extent(vis.displayData, d => d["Publish Year"]);
        const numberOfYears = yearRange[1] - yearRange[0];

        // Create x-axis
        const xAxis = d3.axisBottom(xScale)
            .ticks(numberOfYears)
            .tickFormat(d3.format("d"));

        // Append x-axis to the svg
        vis.svg.append("g")
            .attr("class", "x-axis")
            .attr("transform", `translate(0,${vis.height - 50})`)
            .call(xAxis);

        // Now select all text elements for the x-axis and rotate them if needed
        vis.svg.selectAll(".x-axis text")
            .attr("transform", "rotate(-45)")
            .style("text-anchor", "end");

        // Add vertical gridlines for each year
        const gridlines = vis.svg.selectAll(".gridline")
            .data(d3.range(yearRange[0], yearRange[1] + 1))
            .enter().append("line")
            .attr("class", "gridline")
            .attr("x1", d => xScale(d))
            .attr("x2", d => xScale(d))
            .attr("y1", 0)
            .attr("y2", vis.height - 50)
            .style("stroke", "lightgrey")
            .style("stroke-width", 1)
            .style("stroke-dasharray", "2,2")
            .style("shape-rendering", "crispEdges");

    }
}