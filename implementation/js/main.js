
// load data
let promises = [
    d3.json("data/musicOset_genre_centric_clean.json"),
    d3.json("data/musicOset_artist_centric_clean.json"),
    d3.json("data/musicOset_song_centric_clean.json"),
    d3.json("data/MBTI.json"),
    d3.json("data/mbti_music_data_clean.json")
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
        songData = data[2];

    // create genre visualization instance
    let genreVis = new GenreVis("genre_vis", genreData, artistData, songData);
  
    // MBTI description data
    let mbtiDescData = data[3];

    // create MBTI visualization instance
    let mbtiAll = new mbtiAllVis("mbtiAll", mbtiDescData);
    let mbtiDetail = new mbtiDetailVis("mbtiDetail", mbtiDescData);

    // MBTI test data
    let mbtiTestData = data[4]
    
    // create test instance
    let testSelect = new TestSelection("test_select", mbtiTestData, genreData);

}
