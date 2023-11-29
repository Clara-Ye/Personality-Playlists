let mbtiAll;
let mbtiDetail;
let mbtiMap;
let mbtiMusicDistribution;

let promises = [
    d3.json("data/MBTI.json"),
    d3.json("data/mbti_music_data_clean_pivot.json"),
    d3.json("https://cdn.jsdelivr.net/npm/world-atlas@2/countries-50m.json"),
    d3.csv("data/MBTI_Countries.csv")
];

Promise.all(promises)
    .then(function (data) {
        createVis(data)
    })
    .catch(function (err) {
        console.log(err)
    });

function createVis(data) {
    let mbtiData = data[0]
    let musicData = data[1]
    let geoData = data[2]
    let mbtiMapData = data[3]

    // mbtiAll = new mbtiAllVis("mbtiAll", mbtiData);
    mbtiDetail = new mbtiDetailVis("mbtiDetail", mbtiData);
    mbtiMusicDistribution = new mbtiMusicDistributionVis("mbtiMusicDistribution", mbtiData, musicData);
    mbtiMap = new mbtiMapVis("mbtiMap", mbtiData, geoData, mbtiMapData);

}
