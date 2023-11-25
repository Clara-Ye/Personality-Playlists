class mbtiMusicDistributionVis {

    constructor(_parentElement, _mbtiData, _musicData) {
        this.parentElement = _parentElement;
        this.mbtiData = _mbtiData;
        this.musicData = _musicData;

        this.initVis();
    }

    initVis() {
        let vis = this;

        vis.margin = { top: 40, right: 40, bottom: 40, left: 40 };

        vis.width = document.getElementById(vis.parentElement).getBoundingClientRect().width - vis.margin.left - vis.margin.right;
        vis.height = document.getElementById(vis.parentElement).getBoundingClientRect().height - vis.margin.top - vis.margin.bottom;

        vis.svg = d3.select("#" + vis.parentElement).append("svg")
            .attr("width", vis.width+vis.margin.left+vis.margin.right)
            .attr("height", vis.height+vis.margin.top+vis.margin.bottom)
            .append("g")
            .attr("transform", `translate(${vis.margin.left}, ${vis.margin.top})`);

        vis.defs = vis.svg.append("defs");
        vis.sketchImages = ["circle_01.png", "circle_02.png", "circle_03.png"];
        // Create a pattern for each sketch image
        vis.sketchImages.forEach((sketch, index) => {
            let patternId = 'sketch-pattern-${index}';
            vis.defs.append("pattern")
                .attr("id", patternId)
                .attr("patternUnits", "objectBoundingBox")
                .attr("width", 1)
                .attr("height", 1)
                .append("image")
                .attr("xlink:href", 'img/sketch/${sketch}')
                .attr("width", 1)
                .attr("height", 1)
                .attr("preserveAspectRatio", "xMidYMid slice");
        });

        // Add a selection box for music types
        let selectContainer = d3.select("#" + vis.parentElement).append("div")
            .attr("class", "select-container")
            .style("margin-top", "10px");

        vis.musicTypeSelect = selectContainer
            .append("select")
            .attr("class", "music-type-select");

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
            vis.wrangleData();
        });

        // Set the initial selected music type
        vis.selectedMusicType = vis.uniqueGenres[0];

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

        let displayData = Object.entries(vis.displayDataByMusic).map(([type, average]) => ({ type, average }));


        // Define the radius scale
        let maxAverage = d3.max(displayData, d => d.average);
        let minAverage = d3.min(displayData, d => d.average);
        let radiusScale = d3.scaleSqrt()
            .domain([minAverage, maxAverage])
            .range([20, 80]);


        let circles = vis.svg.selectAll(".mbti-circle")
            .data(displayData, d => d.type);

        circles.enter()
            .append("circle")
            .merge(circles)
            .attr("class", d => `mbti-circle ${d.type}`)
            .attr("r", d => radiusScale(d.average))
            .attr("cx", d => d.x)
            .attr("cy", d => d.y)
            .attr("fill", d => {
                let randomIndex = Math.floor(Math.random() * vis.sketchImages.length);
                return `url(#sketch-pattern-${randomIndex})`;
            })
            .attr("stroke", "black")
            .attr("stroke-width", "2px");

        circles.exit()
            .transition()
            .duration(800)
            .attr("r", 0)
            .remove();

        let labels = vis.svg.selectAll(".mbti-label")
            .data(displayData, d => d.type);

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

        // Create force simulation
        let simulation = d3.forceSimulation(displayData)
            .force("center", d3.forceCenter(vis.width / 2, vis.height / 2))
            .force("charge", d3.forceManyBody().strength(5))
            .force("collide", d3.forceCollide().radius(d => radiusScale(d.average) + 1))
            .on("tick", ticked);

        function ticked() {
            circles
                .attr("cx", d => d.x)
                .attr("cy", d => d.y);

            labels
                .attr("x", d => d.x)
                .attr("y", d => d.y);
        }

        // Restart the simulation with each update
        simulation.nodes(displayData).alpha(1).restart();
    }


}