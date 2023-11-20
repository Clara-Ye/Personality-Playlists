let promises = [
    d3.json("data/MBTI.json"),
    d3.json("data/mbti_music_data_clean_pivot.json")
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

    let mbtiAll = new mbtiAllVis("mbtiAll", mbtiData);
    let mbtiDetail = new mbtiDetailVis("mbtiDetail", mbtiData);
    let mbtiMusicDistribution = new mbtiMusicDistributionVis("mbtiMusicDistribution", mbtiData, musicData);

}
