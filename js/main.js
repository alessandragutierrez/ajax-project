var $spinWheel = document.querySelector('.spin-wheel-button');
var $movieResultContainer = document.querySelector('#result');
var movieResultArray = [];

$spinWheel.addEventListener('click', getMovie);

function getMovie(event) {
  requestMovie();
}

function requestMovie() {
  var xhr = new XMLHttpRequest();
  xhr.open('GET', 'https://api.themoviedb.org/3/discover/movie?api_key=a5e47a4e0a5f7197c6934d0fb4135ec4&language=en-US&include_adult=false&include_video=false&page=1&with_watch_monetization_types=flatrate');
  xhr.responseType = 'json';
  xhr.addEventListener('load', function () {
    // console.log(xhr.status);
    // console.log(xhr.response);
    movieResultArray = xhr.response.results;
    // console.log(movieResultArray);
    for (var i = 0; i < movieResultArray.length; i++) {
      var newMovie = renderMovie(movieResultArray[i]);
      $movieResultContainer.appendChild(newMovie);
    }
  });
  xhr.send();
}

function renderMovie(movie) {
  var $container = document.createElement('div');
  $container.className = 'container';

  var $movie = document.createElement('div');
  $movie.className = 'row center movie';

  var $imgDiv = document.createElement('div');
  $imgDiv.className = 'column-half img-div';

  var $movieDesc = document.createElement('div');
  $movieDesc.className = 'column-half movie-desc';

  var $img = document.createElement('img');
  $img.className = 'border-radius';
  $img.setAttribute('src', 'https://image.tmdb.org/t/p/original' + movie.poster_path);

  var $movieTitle = document.createElement('h1');
  $movieTitle.className = 'weight 500 padding-bottom';
  $movieTitle.textContent = movie.title;

  var $yearDiv = document.createElement('div');
  $yearDiv.className = 'padding-bottom';
  var $yearLabel = document.createElement('span');
  $yearLabel.className = 'weight-600';
  $yearLabel.textContent = 'Year:';
  var $yearContent = document.createElement('span');
  $yearContent.textContent = movie.release_date;

  var $ratingDiv = document.createElement('div');
  $ratingDiv.className = 'padding-bottom';
  var $ratingLabel = document.createElement('span');
  $ratingLabel.className = 'weight-600';
  $ratingLabel.textContent = 'Rating:';
  var $ratingContent = document.createElement('span');
  $ratingContent.textContent = movie.vote_average;

  var $genreDiv = document.createElement('div');
  $genreDiv.className = 'padding-bottom';
  var $genreLabel = document.createElement('span');
  $genreLabel.className = 'weight-600';
  $genreLabel.textContent = 'Genre:';
  var $genreContent = document.createElement('span');
  $genreContent.textContent = movie.genre_ids;

  var $plotSummary = document.createElement('p');
  $plotSummary.textContent = movie.overview;

  $container.appendChild($movie);
  $movie.appendChild($imgDiv);
  $movie.appendChild($movieDesc);
  $imgDiv.appendChild($img);
  $movieDesc.appendChild($movieTitle);
  $movieDesc.appendChild($yearDiv);
  $yearDiv.appendChild($yearLabel);
  $yearDiv.appendChild($yearContent);
  $movieDesc.appendChild($ratingDiv);
  $ratingDiv.appendChild($ratingLabel);
  $ratingDiv.appendChild($ratingContent);
  $movieDesc.appendChild($genreDiv);
  $genreDiv.appendChild($genreLabel);
  $genreDiv.appendChild($genreContent);
  $movieDesc.appendChild($plotSummary);
  return $container;
}
