import React from 'react';

// 手动导入所有图标
// 根据你的图标列表，预导入所有SVG文件
import SmirkIcon from '../../assets/icons/rewards/smirk.svg';
import BagIcon from '../../assets/icons/rewards/bag.svg';
import BookIcon from '../../assets/icons/rewards/book.svg';
import CampingIcon from '../../assets/icons/rewards/camping.svg';
import ChatIcon from '../../assets/icons/rewards/chat.svg';
import DeviceIcon from '../../assets/icons/rewards/device.svg';
import DiceIcon from '../../assets/icons/rewards/dice.svg';
import DictionaryIcon from '../../assets/icons/rewards/dictionary.svg';
import DiscountIcon from '../../assets/icons/rewards/discount.svg';
import FireworksIcon from '../../assets/icons/rewards/fireworks.svg';
import GameIcon from '../../assets/icons/rewards/game.svg';
import GourmetIcon from '../../assets/icons/rewards/gourmet.svg';
import IncreaseIcon from '../../assets/icons/rewards/increase.svg';
import MusicIcon from '../../assets/icons/rewards/music.svg';
import PeaceIcon from '../../assets/icons/rewards/peace.svg';
import PenIcon from '../../assets/icons/rewards/pen.svg';
import PhotoIcon from '../../assets/icons/rewards/photo.svg';
import ProductionIcon from '../../assets/icons/rewards/production.svg';
import PuzzleIcon from '../../assets/icons/rewards/puzzle.svg';
import RobotIcon from '../../assets/icons/rewards/robot.svg';
import SchoolIcon from '../../assets/icons/rewards/school.svg';
import SnorkleIcon from '../../assets/icons/rewards/snorkle.svg';
import SpringIcon from '../../assets/icons/rewards/spring.svg';
import SproutIcon from '../../assets/icons/rewards/sprout.svg';
import StoreIcon from '../../assets/icons/rewards/store.svg';
import TelescopeIcon from '../../assets/icons/rewards/telescope.svg';
import TicketIcon from '../../assets/icons/rewards/ticket.svg';
import ToyIcon from '../../assets/icons/rewards/toy.svg';
import TravelIcon from '../../assets/icons/rewards/travel.svg';
import VrIcon from '../../assets/icons/rewards/vr.svg';
import WatchIcon from '../../assets/icons/rewards/watch.svg';
import WaveIcon from '../../assets/icons/rewards/wave.svg';

// 图标映射表
const iconMap: Record<string, any> = {
  smirk: SmirkIcon,
  bag: BagIcon,
  book: BookIcon,
  camping: CampingIcon,
  chat: ChatIcon,
  device: DeviceIcon,
  dice: DiceIcon,
  dictionary: DictionaryIcon,
  discount: DiscountIcon,
  fireworks: FireworksIcon,
  game: GameIcon,
  gourmet: GourmetIcon,
  increase: IncreaseIcon,
  music: MusicIcon,
  peace: PeaceIcon,
  pen: PenIcon,
  photo: PhotoIcon,
  production: ProductionIcon,
  puzzle: PuzzleIcon,
  robot: RobotIcon,
  school: SchoolIcon,  
  snorkle: SnorkleIcon,
  spring: SpringIcon,
  sprout: SproutIcon,
  store: StoreIcon,
  telescope: TelescopeIcon,
  ticket: TicketIcon,
  toy: ToyIcon,
  travel: TravelIcon,
  vr: VrIcon,
  watch: WatchIcon,
  wave: WaveIcon
};

// 默认图标用于找不到请求的图标时
const DefaultIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <rect width="24" height="24" rx="12" fill="#F3F4F6"/>
    <path d="M12 14V12M12 10H12.01M7 19H17C18.1046 19 19 18.1046 19 17V7C19 5.89543 18.1046 5 17 5H7C5.89543 5 5 5.89543 5 7V17C5 18.1046 5.89543 19 7 19Z" 
          stroke="#9CA3AF" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

interface RewardIconProps {
  name: string;
  className?: string;
}

const RewardIcon: React.FC<RewardIconProps> = ({ name, className = '' }) => {
  // 获取对应图标组件，如果不存在则使用默认图标
  const Icon = iconMap[name] || DefaultIcon;
  
  return (
    <div className={`w-6 h-6 ${className}`}>
      <Icon />
    </div>
  );
};

export default RewardIcon; 