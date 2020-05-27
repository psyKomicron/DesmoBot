import { youtube_v3 } from 'googleapis';
import { YoutubeAPIKey } from '../../../../dal/Readers';
import { YoutubeAPIKeyError } from '../../../../errors/customs/YoutubeAPIKeyError';

export class YoutubeModule
{
    private service: youtube_v3.Youtube;

    public constructor(apiKey: YoutubeAPIKey)
    {
        if (!apiKey.key.match(/([ ])/g))
        {
            this.service = new youtube_v3.Youtube({ auth: apiKey.key });
        }
        else throw new YoutubeAPIKeyError("Provided key is empty", this);
    }

    public get name() { return "youtube-module" };

    /**
     * Search for videos on the Youtube platform and returns an array of results from this request.
     * @param keyword keyword to search for
     * @param maxResults number of maximum results to search
     * @param lang language in wich @keyword is the most relevant for a search
     */
    public async searchVideos(keyword: string, maxResults: number, lang: string): Promise<SearchResults>
    {
        const youtubeUrl = "https://www.youtube.com/watch?v=";
        let opt = {
            part: "snippet",
            order: "viewCount",
            q: keyword,
            type: "video",
            relevanceLanguage: lang,
            maxResults: maxResults
        }
        let items = new Array<YoutubeItem>();
        let searchResults: SearchResults = {totalResults: 0, items: items} 
        let res = await this.service.search.list(opt);
        searchResults.totalResults = res.data.pageInfo.totalResults;
        res.data.items.forEach(item =>
        {
            items.push({
                videoURL: youtubeUrl + item.id.videoId,
                itemID: item.id.videoId,
                title: this.stringify(item.snippet.title),
                kind: item.kind,
                description: this.stringify(item.snippet.description),
                thumbnails: [
                    item.snippet.thumbnails.default.url,
                    item.snippet.thumbnails.medium.url,
                    item.snippet.thumbnails.high.url
                ]
            })
        })
        return searchResults;
    }

    private stringify(value: string)
    {
        return value;
    }
}

export interface SearchResults
{
    /**Number of results returned by the search on Youtube */
    totalResults: number;
    /**Array of search results originating from the request to Youtube's API, transformed for easier use*/
    items: Array<YoutubeItem>;
}

export interface YoutubeItem
{
    /**HTTPS link leading to this item */
    videoURL: string;
    /**Kind of this item (e.g. 'youtube#video') */
    kind?: string;
    /**ID of the item. Is undefined when this item is not a video*/
    itemID: string;
    /**Title of this item */
    title: string;
    /**Description of this item (e.g. classic youtube video description) */
    description?: string;
    /**List of the thumbnails URIs of this item*/
    thumbnails?: Array<string>;
}