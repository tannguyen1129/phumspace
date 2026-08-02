export interface PaginatedMetaContract {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface PaginatedResponseContract<T> {
  data: T[];
  meta: PaginatedMetaContract;
}

export interface HeritageNameContract {
  language: string;
  nameType: string;
  originalValue: string;
  normalizedValue: string;
  script?: string;
}

export interface HeritageCategorySummaryContract {
  id: string;
  slug: string;
  name: string;
}

export interface PlaceSummaryContract {
  id: string;
  slug: string;
  name: string;
  address?: string;
  latitude?: number;
  longitude?: number;
}

export interface HeritageEntityPublicContract {
  id: string;
  slug: string;
  type: string;
  summary: string;
  historicalContent?: string;
  culturalMeaning?: string;
  names: HeritageNameContract[];
  categories: HeritageCategorySummaryContract[];
  places: PlaceSummaryContract[];
  createdAt: string;
  updatedAt: string;
}

export interface PlacePublicContract {
  id: string;
  slug: string;
  name: string;
  address?: string;
  latitude?: number;
  longitude?: number;
  summary?: string;
  createdAt: string;
}

export interface CategoryPublicContract {
  id: string;
  slug: string;
  name: string;
  description?: string;
  createdAt: string;
}

export interface MapMarkerContract {
  id: string;
  slug: string;
  name: string;
  latitude: number;
  longitude: number;
  placeType: string;
  shortDescription?: string;
  address?: string;
  relatedHeritageCount: number;
}

export interface MapPlacesResponseContract {
  data: MapMarkerContract[];
}
