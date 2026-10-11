import { assetUrl } from './runtime';
import { useState } from 'react';
import { Link } from 'react-router-dom';
import { DirectionArrow, Eyebrow, MotionVideo } from './components';
import { useLocale } from './locale';

export default function MovementScenes() {
  const { t, path } = useLocale();
  const [scene, setScene] = useState(1);
  const scenes = [
    { id: 'outside', label: t('فضای باز', 'Outdoors'), src: '/media/training.mp4', poster: '/media/training-poster.jpg', alt: t('مرد در حال حرکت کششی در فضای باز', 'A man stretching outdoors') },
    { id: 'gym', label: t('در باشگاه', 'At the gym'), src: '/media/strength-film.mp4', poster: '/media/strength-film-poster.jpg', alt: t('مرد در حال تمرین با دمبل در باشگاه', 'A man training with a dumbbell at the gym') },
    { id: 'home', label: t('در خانه', 'At home'), src: '/media/home-film.mp4', poster: '/media/home-film-poster.jpg', alt: t('مرد سالمند در حال تمرین با دمبل در خانه', 'An older man training with dumbbells at home') },
  ];
  return <section className="motion-section" aria-label={t('حرکت در فضای زندگی تو', 'Movement in your everyday spaces')}><MotionVideo key={scenes[scene].id} src={scenes[scene].src} poster={scenes[scene].poster} label={scenes[scene].alt}/><div className="motion-overlay"/><div className="container motion-copy"><Eyebrow light>{t('زندگی منتظر نمی‌ماند', 'LIFE KEEPS MOVING')}</Eyebrow><h2>{t('برای چیزی که', 'For the things')}<br/>{t('دوست داری،', 'you love,')}<br/><span>{t('دوباره حرکت کن', 'move again')}</span></h2><p>{t('یک قدم، یک تمرین، یک روز بهتر', 'One step. One session. One better day.')}</p><Link className="button lime" to={path('/start')}>{t('اولین قدم را بردار', 'Take your first step')}<DirectionArrow/></Link></div><div className="film-scenes" role="group" aria-label={t('انتخاب فضای ویدئو', 'Choose a film setting')}>{scenes.map((s,i)=><button key={s.id} aria-pressed={scene === i} onClick={()=>setScene(i)} className={scene === i ? 'active' : ''}><img src={assetUrl(s.poster)} alt=""/>{s.label}</button>)}</div><span className="motion-bottom">HARAKAT / LIFE IN MOTION</span></section>;
}
