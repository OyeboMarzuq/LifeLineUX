export type Verse = {
  tradition: "Bible" | "Hadith";
  reference: string;
  text: string;
};

export const verses: Verse[] = [
  {
    tradition: "Bible",
    reference: "Proverbs 19:17",
    text: "Whoever is kind to the poor lends to the Lord, and He will reward them for what they have done.",
  },
  {
    tradition: "Bible",
    reference: "2 Corinthians 9:7",
    text: "Each of you should give what you have decided in your heart to give, not reluctantly or under compulsion, for God loves a cheerful giver.",
  },
  {
    tradition: "Bible",
    reference: "Acts 20:35",
    text: "Remember the words the Lord Jesus himself said: ‘It is more blessed to give than to receive.’",
  },
  {
    tradition: "Bible",
    reference: "Matthew 25:40",
    text: "Truly I tell you, whatever you did for one of the least of these brothers and sisters of mine, you did for me.",
  },
  {
    tradition: "Hadith",
    reference: "Sahih al-Bukhari 1442",
    text: "The Prophet ﷺ said: ‘Every day two angels descend; one says: O Allah, give the one who spends in charity a good return.’",
  },
  {
    tradition: "Hadith",
    reference: "Sahih Muslim 2588",
    text: "The Messenger of Allah ﷺ said: ‘Charity does not decrease wealth.’",
  },
  {
    tradition: "Hadith",
    reference: "Jami` at-Tirmidhi 664",
    text: "The Prophet ﷺ said: ‘Save yourself from Hell-fire even by giving half a date in charity.’",
  },
  {
    tradition: "Hadith",
    reference: "Sahih al-Bukhari 5353",
    text: "The Prophet ﷺ said: ‘The one who looks after a widow or a poor person is like a mujahid who fights for Allah’s cause.’",
  },
];

export const pickVerse = (seed?: number): Verse => {
  const idx = (typeof seed === "number" ? seed : Math.floor(Math.random() * 1e6)) % verses.length;
  return verses[idx];
};
