import React, { useState, useEffect } from 'react'
import { useLocation, useNavigate } from 'react-router-dom';

import Posts from "../../components/common/Posts";
import CreatePost from "./CreatePost";
import Sidebar from '../../components/common/Sidebar';
import SearchPage from './SearchPage';

function HomePage() {
	const [feedType, setFeedType] = useState("forYou");
	const [page, setPage] = useState("forYou");
	const location = useLocation();
	const navigate = useNavigate();

	// Ambil movieTitle dari query
	const params = new URLSearchParams(location.search);
	const movieTitle = params.get('movieTitle');

	useEffect(() => {
		// Prioritaskan movieTitle: jika ada, selalu tampilkan Posts
		if (movieTitle) {
			if (page !== "forYou") setPage("forYou");
			if (feedType !== "forYou") setFeedType("forYou");
			return;
		}
		if (params.get('tweet') === '1') {
			setPage('tweet');
		} else if (params.get('search') === '1') {
			setPage('search');
		} else {
			setPage('forYou');
		}
	// eslint-disable-next-line
	}, [location.search, movieTitle]);

	const handleHeaderClick = (type) => {
		setFeedType(type);
		setPage('forYou');
		navigate('/');
	};

	return (
		<div className='home-container'>
			{/* Header */}
			<div className='home-container__header'>
				<div
					className={`home-container__header__title${page === "forYou" && feedType === "forYou" ? " active" : ""}`}
					onClick={() => handleHeaderClick("forYou")}
				>
					For you
					{page === "forYou" && feedType === "forYou" && (
						<div className='home-container__header__title__active'></div>
					)}
				</div>
				<div
					className={`home-container__header__title${page === "forYou" && feedType === "following" ? " active" : ""}`}
					onClick={() => handleHeaderClick("following")}
				>
					Following
					{page === "forYou" && feedType === "following" && (
						<div className='home-container__header__title__active'></div>
					)}
				</div>
			</div>

			{/* CREATE POST INPUT (khusus page tweet dari sidebar) */}
			{page === "tweet" && <CreatePost />}

			{/* SEARCH PAGE (khusus page search dari sidebar) */}
			{page === "search" && <SearchPage />}

			{/* POSTS (khusus page forYou/following) */}
			{page === "forYou" && (
				<Posts
					feedType={feedType}
					filterMovieTitle={movieTitle || undefined}
				/>
			)}
		</div>
	);
}

export default HomePage
