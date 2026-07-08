import angry from "../images/pfps/angry.jpg";
import boss from "../images/pfps/boss.jpg";
import cabbit from "../images/pfps/cabbit.jpg";
import cat from "../images/pfps/cat.jpg";
import cion from "../images/pfps/cion.jpg";
import cute from "../images/pfps/cute.jpg";
import extraSad from "../images/pfps/extra-sad.jpg";
import locked from "../images/pfps/locked.jpg";
import poor from "../images/pfps/poor.jpg";
import pray from "../images/pfps/pray.jpg";
import sad from "../images/pfps/sad.jpg";
import shield from "../images/pfps/shield.jpg";
import skyskraper from "../images/pfps/skyskraper.jpg";
import sleepy from "../images/pfps/sleepy.jpg";
import sunglasses from "../images/pfps/sunglasses.jpg";

export const pfps = [
  angry,
  boss,
  cabbit,
  cat,
  cion,
  cute,
  extraSad,
  locked,
  poor,
  pray,
  sad,
  shield,
  skyskraper,
  sleepy,
  sunglasses,
];

export function getPfpForPlayer(socketId) {
  let hash = 0;
  for (let i = 0; i < socketId.length; i++) {
    hash = (hash * 31 + socketId.charCodeAt(i)) | 0;
  }
  return pfps[((hash % pfps.length) + pfps.length) % pfps.length];
}

export const instructions = [
  "Choose a Gif for your friends to battle with",
  "Go against friends to sync the perfect song to the Gif.",
  "Vote for the song that syncs with the GIF the best",
  "Take control of the Aux crown when you triumph over everyone",
];

export const quotes = [
  {
    quote:
      "No Aux battle was ever won according to plan, but no Aux battle was ever won without one.",
    author: "Dwight D. Auxenhower",
  },
  {
    quote:
      "The rush of AuxBattle is often a potent and lethal addiction, for music is a drug.",
    author: "Chris Hedgaux",
  },
  {
    quote: "Music is the battlefield of emotions.",
    author: "Auxie",
  },
  {
    quote: "In Aux battle, there are no unwounded soldiers.",
    author: "José Auxorosky",
  },
  {
    quote: "Only the best have seen the end of aux battle.",
    author: "Auxto",
  },
  {
    quote: "Aux Battles do not determine who is right — only who is left.",
    author: "Auxtrand Russell",
  },
  {
    quote:
      "The supreme art of aux battle is to subdue the enemy without fighting.",
    author: "Aux Tzu",
  },
  {
    quote: "Every Aux battle is won before it's ever fought.",
    author: "Aux Tzu",
  },
  {
    quote: "You may have to fight an Aux battle more than once to win it.",
    author: "Auxgret Thatcher",
  },
  {
    quote: "Gifs in life are intended to make us better, not bitter.",
    author: "Dan Raux",
  },
  {
    quote: "Auxing isn't something you do, it's something you live.",
    author: "Aux-One",
  },
];
