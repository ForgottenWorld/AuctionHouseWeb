import { faArrowLeft } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { useState } from 'react';
import './App.css';
import HomeLink from './components/HomeLink';
import Market from './components/Market';

function App() {

  const [previousPage, setPreviousPage] = useState(null)
  const [nextPage, setNextPage] = useState(null);
  const [currentPage, setCurrentPage] = useState(0);

  const navigateUp = () => {
    if (currentPage === 0 || previousPage === 0) return;
    setPreviousPage(0);
    setTimeout(() => {
      setCurrentPage(0);
      setPreviousPage(null);
    }, 400);
  }

  const navigateToPage = (pageIndex) => {
    setNextPage(pageIndex);
    setTimeout(() => {
      setCurrentPage(pageIndex);
      setNextPage(null);
    }, 400);
  }

  const pages = [
    <div className="page page-home">
      <HomeLink clickAction={() => navigateToPage(1)} />
    </div>,
    <Market />
  ]

  return (
    <div className="app">
      <div className="app-header ">
        {
          currentPage !== 0 && previousPage !== 0
          ? <div className="back-button" onClick={() => navigateUp()}><FontAwesomeIcon icon={faArrowLeft} /></div>
          : null
        }
      </div>
      <div className="app-body">
        <div className="page-container">
          {
            previousPage != null
            ? <div className="page-slidable sliding-in-left">{pages[previousPage]}</div>
            : null
          }
          <div className={`page-slidable ${nextPage != null ? "sliding-out-left" : ""} ${previousPage != null ? "sliding-out-right" : ""}`}>
            {pages[currentPage]}
          </div>
          {
            nextPage != null
            ? <div className="page-slidable sliding-in-right">{pages[nextPage]}</div>
            : null
          }
        </div>
      </div>
    </div>
  );
}

export default App;
