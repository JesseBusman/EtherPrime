"use strict";

var currentDisplayedPage = null;

const pages = [
	$("loadingPage"),
	$("pageAllPrimes"),
	$("pageYourPrimes"),
	$("pageSearch"),
	$("pageCompute"),
	$("pageRanking"),
	$("pageTransactions"),
	$("pageChat"),
	//$("pageMarket"),
];
const pageMenuButtons = [
	null,
	$("menuButton_pageAllPrimes"),
	$("menuButton_pageYourPrimes"),
	$("menuButton_pageSearch"),
	$("menuButton_pageCompute"),
	$("menuButton_pageRanking"),
	$("menuButton_pageTransactions"),
	$("menuButton_pageChat"),
	//$("menuButton_pageMarket"),
];

const PAGE_HASHES = [
	"",
	"allPrimes",
	"yourPrimes",
	"search",
	"compute",
	"ranking",
    "transactions",
    "chat",
    //"market"
];



function showPage(nextDisplayedPage)
{
	if (!allowPageChange) return;

	if (typeof nextDisplayedPage === "string") nextDisplayedPage = $(nextDisplayedPage);
	
	const nextDisplayedPageIndex = pages.indexOf(nextDisplayedPage);
	if (nextDisplayedPageIndex === -1) throw "wtf";
	
	if (currentDisplayedPage === null)
	{
		for (let i=0; i<pages.length; i++)
		{
			if (i === nextDisplayedPageIndex)
			{
				pages[i].style.display = "block";
			}
			else
			{
				pages[i].style.display = "none";
			}
		}
		
		currentDisplayedPage = nextDisplayedPage;
	}
	else
	{
		const currentDisplayedPageIndex = pages.indexOf(currentDisplayedPage);
		if (currentDisplayedPageIndex === -1) throw "wtf";
		
		if (currentDisplayedPage === nextDisplayedPage) return;
		
		currentDisplayedPage.className = "";
		nextDisplayedPage.className = "";
		
		pages[nextDisplayedPageIndex].style.display = "block";
		pages[currentDisplayedPageIndex].style.display = "none";
		
		if (pageMenuButtons[currentDisplayedPageIndex] !== null) pageMenuButtons[currentDisplayedPageIndex].classList.remove("selected");
	}
	
	
	if (pageMenuButtons[nextDisplayedPageIndex] !== null) pageMenuButtons[nextDisplayedPageIndex].classList.add("selected");
	
	
	
	currentDisplayedPage = nextDisplayedPage;
}
