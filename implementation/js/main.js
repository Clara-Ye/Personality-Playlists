
// load data
let promises = [
    d3.json("data/musicOset_genre_centric_clean.json"),
    d3.json("data/musicOset_artist_centric_clean.json"),
    d3.json("data/musicOset_song_centric_clean.json"),
    d3.json("data/musicOset_acoustic_features.json"),
    d3.json("data/MBTI.json"),
    d3.json("data/mbti_music_data_clean.json"),
    d3.json("data/mbti_music_data_clean_pivot.json"),

    //paper data
    d3.json('data/papers.json')
];

Promise.all(promises)
    .then(function (data) {
        createVis(data)
    })
    .catch(function (err) {
        console.log(err)
    });

// init main page
function createVis(data) {

    // musicOset data
    let genreData = data[0],
        artistData = data[1],
        songData = data[2],
        acousticsData = data[3];

    // create genre visualization instance
    let genreVis = new GenreVis("genre_vis", genreData, artistData, songData, acousticsData);

    // MBTI description data
    let mbtiDescData = data[4];

    // create MBTI visualization instance
    //let mbtiAll = new mbtiAllVis("mbtiAll", mbtiDescData);
    let mbtiDetail = new mbtiDetailVis("mbtiDetail", mbtiDescData);

    // MBTI test data
    let mbtiTestData = data[5]

    // create test instance
    let testSelect = new TestSelection("test_select", mbtiTestData, genreData);

    // create music distribution instance
    let mbtiMusicDistribution = new mbtiMusicDistributionVis("mbtiMusicDistribution", mbtiDescData, data[6]);

    //create papers data
    let papersVis = new PapersVis("papers_vis", data[7]);


}