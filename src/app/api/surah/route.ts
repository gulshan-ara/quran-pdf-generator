import { NextRequest, NextResponse } from 'next/server';

// Type definitions for the Quran API response
interface TranslatedName {
  language_name: string;
  name: string;
}

interface Chapter {
  id: number;
  revelation_place: string;
  revelation_order: number;
  bismillah_pre: boolean;
  name_simple: string;
  name_complex: string;
  name_arabic: string;
  verses_count: number;
  pages: number[];
  translated_name: TranslatedName;
}

interface Verse {
  id: number;
  verse_number: number;
  ruku_number: number;
  sajdah_number: number | null;
  text_uthmani: string;
  translations: any[];
  [key: string]: any;
}

interface VersesResponse {
  verses: Verse[];
  meta: {
    current_page: number;
    next_page: number | null;
    prev_page: number | null;
    total_pages: number;
    total_count: number;
    per_page: number;
  };
}

export async function GET(request: NextRequest) {
  try {
    // Get surahId from query params
    const { searchParams } = new URL(request.url);
    const surahId = searchParams.get('surahId') || '1';
    const perPage = 50; // Number of verses per API call

    // First, fetch chapter info to get the total verse count
    const chapterUrl = `https://api.quran.com/api/v4/chapters/${surahId}`;
    const chapterRes = await fetch(chapterUrl, { 
      method: 'GET', 
      headers: { 'Content-Type': 'application/json' } 
    });

    if (!chapterRes.ok) {
      throw new Error(`Chapter HTTP error! status: ${chapterRes.status}`);
    }

    const chapterData = await chapterRes.json();
    const chapter = chapterData.chapter as Chapter;
    const totalVerses = chapter.verses_count;

    // Calculate how many pages we need to fetch
    const totalPages = Math.ceil(totalVerses / perPage);
    
    // Prepare to fetch all pages of verses
    const fetchPromises: Promise<Response>[] = [];
    
    for (let page = 1; page <= totalPages; page++) {
      const versesUrl = `https://api.quran.com/api/v4/verses/by_chapter/${surahId}?translations=20,163&fields=text_uthmani&page=${page}&per_page=${perPage}`;
      fetchPromises.push(
        fetch(versesUrl, { 
          method: 'GET', 
          headers: { 'Content-Type': 'application/json' } 
        })
      );
    }

    // Execute all API calls in parallel
    const responses = await Promise.all(fetchPromises);
    
    // Check if any response failed
    for (let i = 0; i < responses.length; i++) {
      if (!responses[i].ok) {
        throw new Error(`Verses HTTP error on page ${i+1}! status: ${responses[i].status}`);
      }
    }

    // Parse all JSON responses
    const dataPromises = responses.map(res => res.json());
    const allData = await Promise.all(dataPromises);
    
    // Combine all verses from all pages
    let allVerses: Verse[] = [];
    allData.forEach((data: VersesResponse) => {
      allVerses = [...allVerses, ...data.verses];
    });

    // Ensure verses are in correct order
    allVerses.sort((a, b) => a.verse_number - b.verse_number);

    // Filter the chapter to only include the required fields
    const filteredChapter = {
      id: chapter.id,
      bismillah_pre: chapter.bismillah_pre,
      name_simple: chapter.name_simple,
      name_arabic: chapter.name_arabic,
      verses_count: chapter.verses_count,
    };

    // Filter the verses to only include the required fields
    const filteredVerses = allVerses.map((verse: Verse) => ({
      id: verse.id,
      verse_number: verse.verse_number,
      ruku_number: verse.ruku_number,
      sajdah_number: verse.sajdah_number,
      text_uthmani: verse.text_uthmani,
      translations: verse.translations,
    }));

    // Return the filtered data
    return NextResponse.json({ chapter: filteredChapter, verses: filteredVerses }, {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
        'Cache-Control': 'public, s-maxage=3600, stale-while-revalidate=86400',
      },
    });
  } catch (error) {
    console.error('Error fetching Quran verses:', error);
    return NextResponse.json(
      {
        error: 'Failed to fetch Quran verses',
        message: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}