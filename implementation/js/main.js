// load data
let promises = [
    d3.json("data/mbti_music_data_clean.json"),
    d3.json("data/musicOset_genre_centric_clean.json")
];

Promise.all(promises)
    .then(function (data) {
        createVis(data);
    })
    .catch(function (err) {
        console.log(err);
    });

// init main page
function createVis(data) {

    // musicOset data
    let mbtiData = data[0],
        genreData = data[1];

    console.log(mbtiData);
    console.log(genreData);

    // create visualization instance
    let testSelect = new TestSelection("test_select", mbtiData, genreData);

}