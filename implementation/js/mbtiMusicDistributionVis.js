class mbtiMusicDistributionVis {

    constructor(_parentElement, _mbtiData, _musicData) {
        this.parentElement = _parentElement;
        this.mbtiData = _mbtiData;
        this.musicData = _musicData;

        this.initVis();
    }



    initVis() {
        let vis = this;

        // Create a main container
        let mainContainer = d3.select("#" + vis.parentElement)
            .append("div")
            .style("display", "flex")
            .style("align-items", "center");

        // Add a selection box for music types
        let selectContainer = mainContainer.append("div")
            .attr("class", "select-container")
            .style("margin-left", "10%")
            .style("background", `url('img/sketch/rect_2.png')`)
            .style("background-size", "100% 100%")
            .style("width", "250px")
            .style("height", "50px")
            .style("padding", "5px");

        vis.musicTypeSelect = selectContainer
            .append("select")
            .attr("class", "music-type-select")
            .style("border", "none")
            .style("background-color", "transparent")
            .style("color", "black");

        // Extract unique genres
        vis.uniqueGenres = Array.from(new Set(vis.musicData.map(d => d.Genre)));

        vis.musicTypeSelect.selectAll("option")
            .data(vis.uniqueGenres)
            .enter()
            .append("option")
            .text(d => d.replace('rating_', '').replace(/_/g, ' '))
            .attr("value", d => d);

        vis.musicTypeSelect.on("change", function() {
            vis.selectedMusicType = d3.select(this).property("value");
            vis.musicTypeSelect.property("value", vis.selectedMusicType);
            vis.wrangleData();
        });

        // Set the initial selected music type
        vis.selectedMusicType = vis.uniqueGenres[0];

        vis.margin = { top: 20, right: 20, bottom: 20, left: 20 };
        vis.width = document.getElementById(vis.parentElement).getBoundingClientRect().width - vis.margin.left - vis.margin.right;
        vis.height = document.getElementById(vis.parentElement).getBoundingClientRect().height - vis.margin.top - vis.margin.bottom;

        // Append SVG to the main container
        vis.svg = mainContainer.append("svg")
            .attr("width", vis.width)
            .attr("height", vis.height)
            .append("g")
            // .attr("transform", `translate(${vis.margin.left}, ${vis.margin.top})`);

        vis.defs = vis.svg.append("defs");
        vis.sketchImages = ["circle_01.png", "circle_02.png", "circle_03.png", "circle_04.png", "circle_05.png", "circle_06.png",
            "circle_07.png", "circle_08.png", "circle_09.png", "circle_10.png", "circle_11.png", "circle_12.png"];
        // Create a pattern for each sketch image
        vis.defs.append("pattern")
            .attr("id", "hand-drawn-circle")
            .attr("patternUnits", "objectBoundingBox")
            .attr("width", "100%")
            .attr("height", "100%")
            .append("image")
            .attr("xlink:href", "img/sketch/circle_01.png")
            .attr("width", 50)
            .attr("height", 50)
            .attr("preserveAspectRatio", "none");


        // Initialize an empty force simulation
        vis.simulation = d3.forceSimulation()
            .force("center", d3.forceCenter(vis.width*0.7, vis.height /2))
            .force("charge", d3.forceManyBody())
            .force("collide", d3.forceCollide().radius(() => 40))
            .on("tick", () => {
                vis.svg.selectAll(".mbti-circle")
                    .attr("cx", d => d.x)
                    .attr("cy", d => d.y);

                vis.svg.selectAll(".mbti-label")
                    .attr("x", d => d.x)
                    .attr("y", d => d.y);
            });



        vis.wrangleData();
    }

    wrangleData() {
        let vis = this;

        // let filteredDataByMusic = vis.musicData.filter(d => d.Genre === "rating_pop");
        let filteredDataByMusic = vis.musicData.filter(d => d.Genre === vis.selectedMusicType);

        // Initialize an object to hold MBTI type sums and counts
        let mbtiSums = {};
        let mbtiCounts = {};

        // Iterate over filtered data to sum ratings and count entries for each MBTI type
        filteredDataByMusic.forEach(d => {
            let mbtiType = d.mbti_type;
            let rating = d.Rating;

            if (mbtiSums[mbtiType]) {
                mbtiSums[mbtiType] += rating;
                mbtiCounts[mbtiType] += 1;
            } else {
                mbtiSums[mbtiType] = rating;
                mbtiCounts[mbtiType] = 1;
            }
        });

        // Calculate average ratings for each MBTI type
        let mbtiAverages = {};
        for (let mbtiType in mbtiSums) {
            mbtiAverages[mbtiType] = mbtiSums[mbtiType] / mbtiCounts[mbtiType];
        }

        // Define a set of valid MBTI types
        vis.mbtiTypes = new Set([
            "INTJ", "INTP", "ENTJ", "ENTP",
            "INFJ", "INFP", "ENFJ", "ENFP",
            "ISTJ", "ISFJ", "ESTJ", "ESFJ",
            "ISTP", "ISFP", "ESTP", "ESFP"
        ]);

        // Filter out invalid MBTI types from mbtiAverages
        let filteredMbtiAverages = {};
        for (let mbtiType in mbtiAverages) {
            if (vis.mbtiTypes.has(mbtiType)) {
                filteredMbtiAverages[mbtiType] = mbtiAverages[mbtiType];
            }
        }

        // Update displayData with the filtered averages
        vis.displayDataByMusic = filteredMbtiAverages;
        console.log(vis.displayDataByMusic);

        // // Filter data for the selected MBTI type
        // // let filteredDataByMbti = vis.musicData.filter(d => d.mbti_type === selectedMbtiType);
        // let filteredDataByMbti = vis.musicData.filter(d => d.mbti_type === "ENFJ");
        //
        // // Count the occurrences of each genre for the selected MBTI type
        // let genreCounts = {};
        // filteredDataByMbti.forEach(d => {
        //     let genre = d.Genre;
        //     if (genreCounts[genre]) {
        //         genreCounts[genre] += 1;
        //     } else {
        //         genreCounts[genre] = 1;
        //     }
        // });
        //
        // // Calculate the total number of genres for the selected MBTI type
        // let totalGenres = Object.values(genreCounts).reduce((sum, current) => sum + current, 0);
        //
        // // Calculate the percentage of each genre for the selected MBTI type
        // let genrePercentages = {};
        // for (let genre in genreCounts) {
        //     genrePercentages[genre] = (genreCounts[genre] / totalGenres * 100).toFixed(2) + '%';
        // }
        //
        // // Update displayData with the genre percentages for the selected MBTI type
        // vis.displayDataByMbti = genrePercentages;
        // console.log("Total genres:", totalGenres);
        // console.log("Genre counts:", genreCounts);
        // console.log(vis.displayDataByMbti);
        //
        // // Update the visualization
        vis.updateVis();
    }


    updateVis() {
        let vis = this;

        vis.displayData = Object.entries(vis.displayDataByMusic).map(([type, average]) => ({ type, average }));

        // Define the radius scale
        let maxAverage = d3.max(vis.displayData, d => d.average);
        let minAverage = d3.min(vis.displayData, d => d.average);
        vis.radiusScale = d3.scaleSqrt()
            .domain([minAverage, maxAverage])
            .range([20, 80]);


        // Update or create patterns based on the updated circle radius
        vis.displayData.forEach((d, i) => {
            let radius = vis.radiusScale(d.average);
            let patternId = `sketch-pattern-${d.type}`;

            // Remove the old pattern if it exists
            vis.defs.select(`#${patternId}`).remove();

            // Create a new pattern with updated dimensions
            vis.defs.append("pattern")
                .attr("id", patternId)
                .attr("patternUnits", "objectBoundingBox")
                .attr("width", 1)
                .attr("height", 1)
                .append("image")
                .attr("xlink:href", `img/sketch/${vis.sketchImages[i % vis.sketchImages.length]}`)
                .attr("width", radius * 2)
                .attr("height", radius * 2)
                .attr("x", 0)
                .attr("y", 0);
        });

        let circles = vis.svg.selectAll(".mbti-circle")
            .data(vis.displayData, d => d.type);

        circles.enter()
            .append("circle")
            .merge(circles)
            .attr("class", d => `mbti-circle ${d.type}`)
            .attr("r", d => vis.radiusScale(d.average))
            .style("fill", d => `url(#sketch-pattern-${d.type})`)

        circles.exit()
            .transition()
            .duration(800)
            .attr("r", 0)
            .remove();

        let labels = vis.svg.selectAll(".mbti-label")
            .data(vis.displayData, d => d.type);

        labels.enter()
            .append("text")
            .merge(labels)
            .attr("class", "mbti-label")
            .attr("text-anchor", "middle")
            .style("fill", "black")
            .attr("dy", "0.35em")
            .text(d => `${d.type}: ${Number.isFinite(d.average) ? d.average.toFixed(2) : "N/A"}`);


        labels.exit()
            .transition()
            .duration(800)
            .style("fill-opacity", 0)
            .remove();

        // Restart the simulation with each update
        vis.simulation.nodes(vis.displayData).alpha(1).restart();
    }


}