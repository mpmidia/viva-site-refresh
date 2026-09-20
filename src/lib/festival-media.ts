import heroCrowd from "@/assets/festival/hero-crowd.jpg.asset.json";
import brassCity from "@/assets/festival/brass-city.jpg.asset.json";
import audienceTheater from "@/assets/festival/audience-theater.jpg.asset.json";
import performerStage from "@/assets/festival/performer-stage.jpg.asset.json";
import liveShow from "@/assets/festival/live-show.jpg.asset.json";
import artistTalk from "@/assets/festival/artist-talk.jpg.asset.json";
import cityPerformance from "@/assets/festival/city-performance.jpg.asset.json";
import festivalFilm from "@/assets/festival/festival-film.mp4.asset.json";

export const festivalMedia = {
  heroCrowd: heroCrowd.url,
  brassCity: brassCity.url,
  audienceTheater: audienceTheater.url,
  performerStage: performerStage.url,
  liveShow: liveShow.url,
  artistTalk: artistTalk.url,
  cityPerformance: cityPerformance.url,
  film: festivalFilm.url,
} as const;