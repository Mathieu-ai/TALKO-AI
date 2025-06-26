import React from 'react';
import { Link } from 'react-router-dom';
import HomeIcon from '@mui/icons-material/Home';
import InfoIcon from '@mui/icons-material/Info';
import ContactMailIcon from '@mui/icons-material/ContactMail';
import TextFieldsIcon from '@mui/icons-material/TextFields';
import PsychologyIcon from '@mui/icons-material/Psychology';

const items = [
  {
    title: 'Home',
    path: '/',
    icon: <HomeIcon />,
  },
  {
    title: 'About',
    path: '/about',
    icon: <InfoIcon />,
  },
  {
    title: 'Contact',
    path: '/contact',
    icon: <ContactMailIcon />,
  },
  {
    title: 'Text Analysis',
    path: '/nlp',
    icon: <TextFieldsIcon />,
  },
  {
    title: 'AI Insights',
    path: '/deep-learning',
    icon: <PsychologyIcon />,
  },
];

const Sidebar = () => {
  return (
    <div className="sidebar">
      <ul>
        {items.map((item, index) => (
          <li key={index}>
            <Link to={item.path}>
              {item.icon}
              <span>{item.title}</span>
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default Sidebar;