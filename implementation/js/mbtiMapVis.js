class mbtiMapVis {

    constructor(_parentElement, _mbtiData, _geoData, _mbtiMapData) {
        this.parentElement = _parentElement;
        this.mbtiData = _mbtiData;
        this.geoData = _geoData;
        this.mbtiMapData = _mbtiMapData;

        this.initVis();
    }

    initVis() {
        let vis = this;

        vis.margin = { top: 20, right: 20, bottom: 20, left: 20 };
        vis.width = document.getElementById(vis.parentElement).getBoundingClientRect().width - vis.margin.left - vis.margin.right;
        vis.height = document.getElementById(vis.parentElement).getBoundingClientRect().height - vis.margin.top - vis.margin.bottom;

        // Create a main container
        vis.mainContainer = d3.select("#" + vis.parentElement)
            .append("div")
            .style("display", "flex")
            .style("align-items", "center");

        // Add a selection box for music types
        let selectContainer = vis.mainContainer.append("div")
            .attr("class", "select-container")
            .style("margin-left", "10%")
            .style("background", `url('img/sketch/rect_5.png')`)
            .style("background-size", "100% 100%")
            .style("width", "20%")
            .style("height", "50px")
            .style("padding", "5px");

        vis.mbtiTypeSelect = selectContainer
            .append("select")
            .attr("class", "mbti-type-select")
            .style("border", "none")
            .style("background-color", "transparent")
            .style("color", "black");

        // Extract unique genres
        vis.uniqueGenres = ["ENFJ", "ENFP", "ENTJ", "ENTP", "ESFJ", "ESFP", "ESTJ", "ESTP", "INFJ", "INFP", "INTJ", "INTP", "ISFJ", "ISFP", "ISTJ", "ISTP"];

        vis.mbtiTypeSelect.selectAll("option")
            .data(vis.uniqueGenres)
            .enter()
            .append("option")
            .text(d => d)
            .attr("value", d => d);

        vis.mbtiTypeSelect.on("change", function() {
            vis.selectedMBTIType = d3.select(this).property("value");
            vis.mbtiTypeSelect.property("value", vis.selectedMBTIType);
            vis.wrangleData();
        });

        // Set the initial selected music type
        vis.selectedMBTIType = vis.uniqueGenres[0];

        // Append SVG to the main container
        vis.svg = vis.mainContainer.append("svg")

        //adjust the scale by zoom factor
        let zoomFactor = vis.height / 600;
        let defaultScale = 230;
        let mapPosition = 0.6;
        vis.projection = d3
            .geoOrthographic()
            // .geoStereographic()
            .clipAngle(90)
            .translate([vis.width * mapPosition, vis.height / 2])
            .scale(defaultScale * zoomFactor);

        vis.path = d3.geoPath()
            .projection(vis.projection);

        // append tooltip
        vis.tooltip = vis.mainContainer.append('div')
            // .attr('class', "tooltip")
            .attr('id', 'mapTooltip')
            .style("opacity", 0);

        // hand sketch style texture
        vis.svg.append("defs")
            .append("pattern")
            .attr("id", "hand-drawn-texture")
            .attr("patternUnits", "userSpaceOnUse")
            .attr("width", 200)
            .attr("height", 200)
            .append("image")
            .attr("xlink:href", "img/sphere_texture.jpg")
            .attr("width", 200)
            .attr("height", 200);


        //sphere behind the map
        vis.sphere = vis.svg.append("path")
            .datum({type: "Sphere"})
            .attr("class", "graticule")
            .attr("fill", "url(#hand-drawn-texture)")
            .attr("stroke", "rgba(129,129,129,0.35)")
            .attr("d", vis.path);


        // Append legend group to the SVG
        vis.legendWidth = 200;
        vis.legendHeight = 20;
        vis.numSegments = 10;
        vis.legend = vis.svg.append("g")
            .attr("class", "legend")
            .attr("transform", `translate(${vis.width * mapPosition - vis.legendWidth/2}, ${vis.height - 60})`);

        vis.countriesGroup = vis.svg.append("g")
            .attr("class", "countries");

        window.addEventListener('resize', () => vis.handleResize());

        vis.wrangleData();
        vis.handleResize();
    }

    handleResize() {
        let vis = this;

        // Update width and height based on the new window size
        vis.width = document.getElementById(vis.parentElement).getBoundingClientRect().width - vis.margin.left - vis.margin.right;
        vis.height = document.getElementById(vis.parentElement).getBoundingClientRect().height - vis.margin.top - vis.margin.bottom;

        // Update the SVG dimensions
        vis.svg.attr("width", vis.width)
            .attr("height", vis.height)

        //adjust the scale by zoom factor
        let zoomFactor = vis.height / 600;
        let defaultScale = 230;
        let mapPosition = 0.6;
        vis.projection
            .translate([vis.width * mapPosition, vis.height / 2])
            .scale(defaultScale * zoomFactor);

        vis.path.projection(vis.projection);
        vis.countriesGroup.selectAll(".country").attr("d", vis.path);
        vis.sphere.attr("d", vis.path);
        vis.legend.attr("transform", `translate(${vis.width * mapPosition - vis.legendWidth/2}, ${vis.height - 30})`);

        vis.updateVis();
    }

    wrangleData() {
        let vis = this;

        // create random data structure with information for each land
        vis.countryInfo = {};

        let mbtiTypesAT = ["ESTJ-A", "ESFJ-A", "INFP-T", "ESFJ-T", "ENFP-T", "ENFP-A", "ESTJ-T", "ISFJ-T", "ENFJ-A", "ESTP-A", "ISTJ-A", "INTP-T", "INFJ-T", "ISFP-T", "ENTJ-A", "ESTP-T", "ISTJ-T", "ESFP-T", "ENTP-A", "ESFP-A", "INTJ-T", "ISFJ-A", "INTP-A", "ENTP-T", "ISTP-T", "ENTJ-T", "ISTP-A", "INFP-A", "ENFJ-T", "INTJ-A", "ISFP-A", "INFJ-A"];
        let mbtiTypes = ["ESTJ", "ESFJ", "INFP", "ESFJ", "ENFP", "ENFP", "ESTJ", "ISFJ", "ENFJ", "ESTP", "ISTJ", "INTP", "INFJ", "ISFP", "ENTJ", "ESTP", "ISTJ", "ESFP", "ENTP", "ESFP", "INTJ", "ISFJ", "INTP", "ENTP", "ISTP", "ENTJ", "ISTP", "INFP", "ENFJ", "INTJ", "ISFP", "INFJ"];



        vis.geoData.objects.countries.geometries.forEach(d => {
            let mbtiDataWithZeros = {};
            mbtiTypes.forEach(type => mbtiDataWithZeros[type] = 0);

            vis.countryInfo[d.properties.name] = {
                countryName: d.properties.name,
                mbtiData: mbtiDataWithZeros,
                color: "#ccc"
            };
        })

        vis.mbtiMapData.forEach(row => {
            if (vis.countryInfo.hasOwnProperty(row.Country)) {
                mbtiTypes.forEach(type => {
                    //NO A/T
                    let typeA = type + "-A";
                    let typeT = type + "-T";
                    row[typeA] = +row[typeA];
                    row[typeT] = +row[typeT];
                    vis.countryInfo[row.Country].mbtiData[type] = row[typeA] + row[typeT];

                    //Use A/T
                    // row[type] = +row[type];
                    // vis.countryInfo[row.Country].mbtiData[type] = row[type];
                });
            }
        });

        // Determine the max and min values for the selected MBTI type
        let mbtiValues = Object.values(vis.countryInfo).map(country => country.mbtiData[vis.selectedMBTIType]);
        let mbtiNonZeroValues = mbtiValues.filter(value => value > 0); // Filter out zero values

        vis.maxValue = mbtiNonZeroValues.length > 0 ? Math.max(...mbtiNonZeroValues) : 0;
        vis.minValue = mbtiNonZeroValues.length > 0 ? Math.min(...mbtiNonZeroValues) : 0;

        vis.colorScale = d3.scaleLinear()
            .domain([vis.minValue, vis.maxValue])
            .range(['rgba(85,217,229,0.66)', 'rgba(24,27,178,0.73)']);

        Object.keys(vis.countryInfo).forEach(countryKey => {
            const countryData = vis.countryInfo[countryKey].mbtiData;
            const allZeros = Object.values(countryData).every(value => value === 0);

            // If all values are zero, set color to grey, otherwise use the color scale
            if (allZeros) {
                vis.countryInfo[countryKey].color = "rgba(86,86,86,0.4)";
            } else {
                let mbtiValue = countryData[vis.selectedMBTIType];
                vis.countryInfo[countryKey].color = vis.colorScale(mbtiValue);
            }
        });

        // Convert TopoJSON to GeoJSON (target object = 'states')
        vis.world = topojson.feature(vis.geoData, vis.geoData.objects.countries).features;

        vis.updateVis();
    }

    updateVis() {
        let vis = this;

        //draw countries
        vis.countries = vis.countriesGroup
            .selectAll(".country")
            .data(vis.world);

        vis.countriesEnter = vis.countries.enter()
            .append("path")
            .attr('class', 'country')
            .attr("d", vis.path)
            .style("fill", d => {
                let countryName = d.properties.name;

                let mbtiValue = vis.countryInfo[countryName].mbtiData[vis.selectedMBTIType];
                return vis.colorScale(mbtiValue);
                // let countryInfo = vis.countryInfo[countryName];
                // return countryInfo.color;
            })

        //update
        vis.countriesEnter
            .merge(vis.countries)
            .transition()
            .duration(500)
            .style("fill", d => {
                const countryName = d.properties.name;
                const countryInfo = vis.countryInfo[countryName];
                return countryInfo.color;
            });

        vis.countriesEnter
            .on('mouseover', function (event, d) {
                d3.select(this)
                    .attr('stroke-width', '2px')
                    .attr('stroke', 'black')
                    .attr('fill', 'rgba(173,222,255,0.62)');

                let countryMBTIData = vis.countryInfo[d.properties.name].mbtiData;
                let allZeros = Object.values(countryMBTIData).every(value => value === 0);

                let tooltipHtml;

                if (allZeros) {
                    // Tooltip for countries with no MBTI data
                    tooltipHtml = `
                    <div style="border: thin solid grey; border-radius: 5px; background: lightgrey; padding: 20px">
                        <strong><p>${d.properties.name}</p></strong>
                        <p>No Data</p>
                    </div>`;
                } else {
                    // Find the MBTI types with the highest and lowest values
                    let maxType = null, minType = null, maxValue = -Infinity, minValue = Infinity;
                    Object.entries(countryMBTIData).forEach(([type, value]) => {
                        if (value > maxValue) {
                            maxValue = value;
                            maxType = type;
                        }
                        if (value < minValue) {
                            minValue = value;
                            minType = type;
                        }
                    });

                    maxValue = (maxValue * 100).toFixed(2);
                    minValue = (minValue * 100).toFixed(2);

                    // Tooltip for countries with MBTI data
                    tooltipHtml = `
                    <div style="border: thin solid grey; border-radius: 5px; background: lightgrey; padding: 20px">
                        <strong><p>${d.properties.name}</p></strong>
                        <p>Most MBTI: ${maxType} : ${maxValue}%</p>
                        <p>Least MBTI: ${minType} : ${minValue}%</p>
                    </div>`;
                }



                vis.tooltip
                    .style("opacity", 1)
                    .html(tooltipHtml)
                    .style("left", (event.pageX) + "px")
                    .style("top", (event.pageY + 60) + "px");
            })
            .on('mouseout', function (event, d) {
                d3.select(this)
                    .attr('stroke-width', '0px')
                    .attr('fill', d => {
                        let countryName = d.properties.name;
                        let countryInfo = vis.countryInfo[countryName];
                        return countryInfo.color;
                    });

                vis.tooltip
                    .style("opacity", 0)
                    .html("");
            });

        vis.countries.exit().remove();

        //drag the ball
        let m0,o0;
        vis.svg.call(
            d3.drag()
                .on("start", function (event) {
                    let lastRotationParams = vis.projection.rotate();
                    m0 = [event.x, event.y];
                    o0 = [-lastRotationParams[0], -lastRotationParams[1]];
                })
                .on("drag", function (event) {
                    if (m0) {
                        let m1 = [event.x, event.y],
                            o1 = [o0[0] + (m0[0] - m1[0]) / 4, o0[1] + (m1[1] - m0[1]) / 4];
                        vis.projection.rotate([-o1[0], -o1[1]]);
                    }
                    // Update the map
                    vis.path = d3.geoPath().projection(vis.projection);
                    d3.selectAll(".country").attr("d", vis.path)
                    d3.selectAll(".graticule").attr("d", vis.path)
                })
        )

        //draw legend
        const legendScale = d3.scaleLinear()
            .domain(vis.colorScale.domain())
            .range([0, vis.legendWidth]);

        const legendAxis = d3.axisBottom(legendScale)
            .ticks(3)
            .tickValues([vis.minValue, (vis.maxValue+vis.minValue)/2 ,vis.maxValue])
            .tickFormat(d => `${(d * 100).toFixed(2)}%`);

        // Append the legend axis
        vis.legend.call(legendAxis)
            .selectAll(".tick text")
            .style("font-size", "15px");

        // Create legend segments
        const legendData = d3.range(vis.numSegments).map(i => {
            const [min, max] = vis.colorScale.domain();
            const step = (max - min) / vis.numSegments;
            return min + i * step;
        });

        vis.legend.selectAll(".legend-rect")
            .data(legendData)
            .enter()
            .append("rect")
            .attr("class", "legend-rect")
            .attr("x", d => legendScale(d))
            .attr("y", -vis.legendHeight)
            .attr("width", vis.legendWidth / vis.numSegments)
            .attr("height", vis.legendHeight)
            .attr("fill", d => vis.colorScale(d));
    }
}
