import axios from 'axios';
import Notiflix from 'notiflix';
import SimpleLightbox from 'simplelightbox';
import 'simplelightbox/dist/simple-lightbox.min.css';

let currentPage = 1;
let currentSearchQuery = '';

const form = document.querySelector('#search-form');
const loadMoreButton = document.querySelector('.load-more');
const gallery = document.querySelector('.gallery');
loadMoreButton.style.display = 'none';

const fetchData = async (searchQuery, page) => {
  try {
    const response = await axios.get(
      `https://pixabay.com/api/?key=42559721-23019ebdc9c26ab38ac5dea66&q=${searchQuery}&image_type=photo&orientation=horizontal&safesearch=true&per_page=40&page=${page}`
    );
    const { hits, totalHits } = response.data;
    return { hits, totalHits };
  } catch (error) {
    console.error('Error', error);
    throw error;
  }
};

const displayImages = (hits, totalHits) => {
  if (hits.length === 0) {
    Notiflix.Notify.failure(
      'Sorry, there are no images matching your search query. Please try again.'
    );
  } else {
    const markupArray = hits.map(
      ({
        webformatURL,
        largeImageURL, //added for SimpleLightbox
        tags, //added for SimpleLightbox
        likes,
        views,
        comments,
        downloads, // added BELOW for SimpleLightbox
      }) => `<div class="photo-card"><a class="gallery__item" href="${largeImageURL}"> 
  <img class="gallery__image" src="${webformatURL}" alt="${tags}" loading="lazy" /></a> 
  <div class="info"> 
  <p class="info-item"><b>Likes ${likes}</b></p>
  <p class="info-item"><b>Views ${views}</b></p>
  <p class="info-item"><b>Comments ${comments}</b></p>
  <p class="info-item"><b>Downloads ${downloads}</b></p>
  </div>
  </div>`
    );
    gallery.innerHTML = gallery.innerHTML + markupArray.join('');

    lightbox = new SimpleLightbox('.gallery a'); //added SimpleLightbox

    const { height: cardHeight } = document //smooth scroll start
      .querySelector('.gallery')
      .firstElementChild.getBoundingClientRect();

    window.scrollBy({
      top: cardHeight * 2,
      behavior: 'smooth',
    }); //smooth scroll end

    if (totalHits > gallery.children.length) {
      loadMoreButton.style.display = 'block';
    } else {
      loadMoreButton.style.display = 'none';
      Notiflix.Notify.info(
        "We're sorry, but you've reached the end of search results."
      );
    }
    if (currentPage === 1) {
      Notiflix.Notify.info(`Hooray! We found ${totalHits} images.`);
    }
  }
};

const getDataAndDisplayImages = async (searchQuery, page) => {
  try {
    const { hits, totalHits } = await fetchData(searchQuery, page);
    displayImages(hits, totalHits);
    currentPage = page + 1;
  } catch (error) {
    console.error('Error fetching data and displaying images:', error);
  }
};

const formSubmit = async event => {
  event.preventDefault();
  loadMoreButton.style.display = 'none';
  const searchQuery = document.querySelector(
    '#search-form input[name="searchQuery"]'
  ).value;
  if (searchQuery !== currentSearchQuery) {
    currentPage = 1;
    currentSearchQuery = searchQuery;
    gallery.innerHTML = '';
    await getDataAndDisplayImages(searchQuery, currentPage);
  }
};

const loadMore = async () => {
  const searchQuery = document.querySelector(
    '#search-form input[name="searchQuery"]'
  ).value;
  await getDataAndDisplayImages(searchQuery, currentPage);
};

form.addEventListener('submit', formSubmit);
loadMoreButton.addEventListener('click', loadMore);
