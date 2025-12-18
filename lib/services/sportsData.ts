import AsyncStorage from '@react-native-async-storage/async-storage';

const ODDS_API_BASE = 'https://api.the-odds-api.com/v4';
const CACHE_KEY = 'meshbet_sports_cache';
const CACHE_DURATION = 5 * 60 * 1000;

export interface SportEvent {
  id: string;
  sport: string;
  sportTitle: string;
  homeTeam: string;
  awayTeam: string;
  commenceTime: string;
  bookmakers?: Bookmaker[];
}

export interface Bookmaker {
  key: string;
  title: string;
  markets: Market[];
}

export interface Market {
  key: string;
  outcomes: Outcome[];
}

export interface Outcome {
  name: string;
  price: number;
}

export interface CachedData {
  events: SportEvent[];
  timestamp: number;
}

class SportsDataService {
  private apiKey: string | null = null;
  private cache: Map<string, CachedData> = new Map();

  setApiKey(key: string) {
    this.apiKey = key;
  }

  async getUpcomingEvents(sport: string = 'upcoming'): Promise<SportEvent[]> {
    const cacheKey = `events_${sport}`;
    const cached = this.cache.get(cacheKey);
    
    if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
      return cached.events;
    }

    if (!this.apiKey) {
      console.log('[SportsData] No API key set, returning mock data');
      return this.getMockEvents();
    }

    try {
      const response = await fetch(
        `${ODDS_API_BASE}/sports/${sport}/odds/?apiKey=${this.apiKey}&regions=us&markets=h2h`
      );

      if (!response.ok) {
        throw new Error(`API error: ${response.status}`);
      }

      const data = await response.json();
      const events: SportEvent[] = data.map((event: any) => ({
        id: event.id,
        sport: event.sport_key,
        sportTitle: event.sport_title,
        homeTeam: event.home_team,
        awayTeam: event.away_team,
        commenceTime: event.commence_time,
        bookmakers: event.bookmakers,
      }));

      this.cache.set(cacheKey, { events, timestamp: Date.now() });
      await this.persistCache();

      return events;
    } catch (error) {
      console.error('[SportsData] Failed to fetch events:', error);
      
      const storedCache = await this.loadCache();
      if (storedCache[cacheKey]) {
        return storedCache[cacheKey].events;
      }
      
      return this.getMockEvents();
    }
  }

  async getEventOdds(eventId: string, sport: string): Promise<SportEvent | null> {
    if (!this.apiKey) {
      console.log('[SportsData] No API key, returning mock odds');
      return this.getMockEventWithOdds(eventId);
    }

    try {
      const response = await fetch(
        `${ODDS_API_BASE}/sports/${sport}/events/${eventId}/odds?apiKey=${this.apiKey}&regions=us&markets=h2h,spreads,totals`
      );

      if (!response.ok) {
        throw new Error(`API error: ${response.status}`);
      }

      const data = await response.json();
      return {
        id: data.id,
        sport: data.sport_key,
        sportTitle: data.sport_title,
        homeTeam: data.home_team,
        awayTeam: data.away_team,
        commenceTime: data.commence_time,
        bookmakers: data.bookmakers,
      };
    } catch (error) {
      console.error('[SportsData] Failed to fetch odds:', error);
      return this.getMockEventWithOdds(eventId);
    }
  }

  async getSports(): Promise<{ key: string; title: string; active: boolean }[]> {
    if (!this.apiKey) {
      return [
        { key: 'americanfootball_nfl', title: 'NFL', active: true },
        { key: 'basketball_nba', title: 'NBA', active: true },
        { key: 'mma_mixed_martial_arts', title: 'MMA', active: true },
        { key: 'soccer_usa_mls', title: 'MLS', active: true },
        { key: 'baseball_mlb', title: 'MLB', active: true },
      ];
    }

    try {
      const response = await fetch(
        `${ODDS_API_BASE}/sports/?apiKey=${this.apiKey}`
      );

      if (!response.ok) {
        throw new Error(`API error: ${response.status}`);
      }

      const data = await response.json();
      return data.filter((sport: any) => sport.active).map((sport: any) => ({
        key: sport.key,
        title: sport.title,
        active: sport.active,
      }));
    } catch (error) {
      console.error('[SportsData] Failed to fetch sports:', error);
      return [];
    }
  }

  private getMockEvents(): SportEvent[] {
    const now = new Date();
    return [
      {
        id: 'mock_ufc_001',
        sport: 'mma_mixed_martial_arts',
        sportTitle: 'MMA',
        homeTeam: 'Jon Jones',
        awayTeam: 'Stipe Miocic',
        commenceTime: new Date(now.getTime() + 2 * 60 * 60 * 1000).toISOString(),
        bookmakers: [
          {
            key: 'draftkings',
            title: 'DraftKings',
            markets: [
              {
                key: 'h2h',
                outcomes: [
                  { name: 'Jon Jones', price: -280 },
                  { name: 'Stipe Miocic', price: +230 },
                ],
              },
            ],
          },
        ],
      },
      {
        id: 'mock_nfl_001',
        sport: 'americanfootball_nfl',
        sportTitle: 'NFL',
        homeTeam: 'Kansas City Chiefs',
        awayTeam: 'Buffalo Bills',
        commenceTime: new Date(now.getTime() + 24 * 60 * 60 * 1000).toISOString(),
        bookmakers: [
          {
            key: 'fanduel',
            title: 'FanDuel',
            markets: [
              {
                key: 'h2h',
                outcomes: [
                  { name: 'Kansas City Chiefs', price: -145 },
                  { name: 'Buffalo Bills', price: +125 },
                ],
              },
            ],
          },
        ],
      },
      {
        id: 'mock_nba_001',
        sport: 'basketball_nba',
        sportTitle: 'NBA',
        homeTeam: 'Los Angeles Lakers',
        awayTeam: 'Boston Celtics',
        commenceTime: new Date(now.getTime() + 3 * 60 * 60 * 1000).toISOString(),
        bookmakers: [
          {
            key: 'betmgm',
            title: 'BetMGM',
            markets: [
              {
                key: 'h2h',
                outcomes: [
                  { name: 'Los Angeles Lakers', price: +110 },
                  { name: 'Boston Celtics', price: -130 },
                ],
              },
            ],
          },
        ],
      },
    ];
  }

  private getMockEventWithOdds(eventId: string): SportEvent {
    const events = this.getMockEvents();
    return events.find(e => e.id === eventId) || events[0];
  }

  private async persistCache(): Promise<void> {
    try {
      const cacheObj: Record<string, CachedData> = {};
      this.cache.forEach((value, key) => {
        cacheObj[key] = value;
      });
      await AsyncStorage.setItem(CACHE_KEY, JSON.stringify(cacheObj));
    } catch (error) {
      console.error('[SportsData] Failed to persist cache:', error);
    }
  }

  private async loadCache(): Promise<Record<string, CachedData>> {
    try {
      const data = await AsyncStorage.getItem(CACHE_KEY);
      if (data) {
        return JSON.parse(data);
      }
    } catch (error) {
      console.error('[SportsData] Failed to load cache:', error);
    }
    return {};
  }

  formatOdds(price: number): string {
    if (price >= 0) {
      return `+${price}`;
    }
    return `${price}`;
  }

  formatTime(isoString: string): string {
    const date = new Date(isoString);
    const now = new Date();
    const diffMs = date.getTime() - now.getTime();
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffDays = Math.floor(diffHours / 24);

    if (diffHours < 0) {
      return 'LIVE';
    } else if (diffHours < 1) {
      const diffMins = Math.floor(diffMs / (1000 * 60));
      return `${diffMins}m`;
    } else if (diffHours < 24) {
      return `${diffHours}h`;
    } else {
      return `${diffDays}d`;
    }
  }
}

export const sportsDataService = new SportsDataService();
