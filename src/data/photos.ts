// Every photo on the site, with its author. All come from Unsplash (Unsplash License) and are graded
// by scripts/photos.py. They show other places and other people's things: the club is fictional, and
// the page says so next to the gallery.
import type { ImageMetadata } from 'astro';
import lampRoom from '../assets/photos/lamp-room.jpg';
import shade from '../assets/photos/shade.jpg';
import keyboard from '../assets/photos/keyboard.jpg';
import gamepad from '../assets/photos/gamepad.jpg';
import headphones from '../assets/photos/headphones.jpg';
import friends from '../assets/photos/friends.jpg';
import player from '../assets/photos/player.jpg';
import player2 from '../assets/photos/player-2.jpg';
import consolePhoto from '../assets/photos/console.jpg';
import duo from '../assets/photos/duo.jpg';
import lamp from '../assets/photos/lamp.jpg';
import street from '../assets/photos/street.jpg';
import room from '../assets/photos/room.jpg';

export interface Photo {
  src: ImageMetadata;
  alt: string;
  author: string;
  url: string;
}

const page = (slug: string) => `https://unsplash.com/photos/${slug}`;
const file = (id: string) => `https://images.unsplash.com/photo-${id}`;

export const photos = {
  lampRoom: { src: lampRoom, alt: 'Настольная лампа с тканевым абажуром в тёмной комнате', author: 'Khanh Do', url: file('1704536345279-4b7dfa0c166d') },
  shade: { src: shade, alt: 'Лампа с плиссированным абажуром на деревянной ножке', author: 'Nayem Islam', url: file('1780140765084-88e4e0d75528') },
  keyboard: { src: keyboard, alt: 'Клавиши механической клавиатуры крупным планом', author: 'Christian Wiediger', url: page('WkfDrhxDMC8') },
  gamepad: { src: gamepad, alt: 'Геймпад на деревянном столе в тёплом свете', author: 'Alexey Savchenko', url: file('1552820728-8b83bb6b773f') },
  headphones: { src: headphones, alt: 'Игровые наушники на тёмном столе', author: 'Jason Leung', url: file('1599669454699-248893623440') },
  friends: { src: friends, alt: 'Компания друзей радуется за спиной у игрока', author: 'ELLA DON', url: page('nGabsCyFVps') },
  player: { src: player, alt: 'Игрок в наушниках за компьютером в полутёмном зале', author: 'ELLA DON', url: page('ryoyIr9RJso') },
  player2: { src: player2, alt: 'Девушка играет за компьютером в игровом зале', author: 'ELLA DON', url: page('ATNqaUYUcy0') },
  console: { src: consolePhoto, alt: 'Две пары рук с геймпадами перед телевизором', author: 'JESHOOTS.COM', url: page('eCktzGjC-iU') },
  duo: { src: duo, alt: 'Двое играют за компьютерами в тёмном зале', author: 'Raman Shaunia', url: page('l24i-13LtHo') },
  lamp: { src: lamp, alt: 'Абажур лампы светится тёплым светом', author: 'Roman Kravtsov', url: file('1758789886430-34bdb4701e69') },
  street: { src: street, alt: 'Вечерняя московская улица в снегопад', author: 'Anastasia Zolotukhina', url: file('1734115861523-971b65914ad3') },
  room: { src: room, alt: 'Игровое место с большим монитором в клубе', author: 'ELLA DON', url: page('Dd13AnHz_VA') },
} satisfies Record<string, Photo>;

/** One credit per author, in the order the photos appear above. */
export const credits: Photo[] = [...new Map(Object.values(photos).map((ph) => [ph.author, ph])).values()];
