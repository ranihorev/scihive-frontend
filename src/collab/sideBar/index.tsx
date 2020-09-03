import { Collapse, List, ListItem, ListItemIcon, ListItemText, Typography } from '@material-ui/core';
import AccountTreeIcon from '@material-ui/icons/AccountTree';
import ExpandLess from '@material-ui/icons/ExpandLess';
import ExpandMore from '@material-ui/icons/ExpandMore';
import InfoIcon from '@material-ui/icons/Info';
import WarningIcon from '@material-ui/icons/Warning';
import { isEmpty, range } from 'lodash';
import React from 'react';
import ContentLoader from 'react-content-loader';
import { useHistory } from 'react-router';
import shallow from 'zustand/shallow';
import baseStyles from '../../base.module.scss';
import { usePaperStore } from '../../stores/paper';
import { Info } from '../Info';
import { Spacer } from '../utils/Spacer';
import styles from './styles.module.scss';

export const PaperSections: React.FC = () => {
  const history = useHistory();
  const sections = usePaperStore(state => state.sections, shallow);
  if (sections === undefined) {
    return (
      <React.Fragment>
        {range(0, 5).map(idx => (
          <ContentLoader key={idx} height={100}>
            <React.Fragment>
              <rect x="0" y="0" rx="3" ry="3" width="90%" height="13" />
              <rect x="0" y="30" rx="3" ry="3" width="80%" height="13" />
              <rect x="20" y="60" rx="3" ry="3" width="80%" height="13" />
            </React.Fragment>
          </ContentLoader>
        ))}
      </React.Fragment>
    );
  }

  if (isEmpty(sections)) {
    return (
      <div className={baseStyles.centeredRow}>
        <WarningIcon fontSize="small" />
        <Spacer size={8} />
        <Typography variant="body2">Failed to extract sections</Typography>
      </div>
    );
  }

  return (
    <>
      {sections.map((section, idx) => {
        return (
          <span
            onClick={() => {
              history.push({ hash: `section-${idx}` });
            }}
            key={idx}
          >
            {section.str}
          </span>
        );
      })}
    </>
  );
};

const CollapsibleItem: React.FC<{ icon?: React.ReactElement; title: string }> = ({ icon, title, children }) => {
  const [isOpen, setIsOpen] = React.useState(false);
  return (
    <>
      <ListItem button onClick={() => setIsOpen(state => !state)}>
        {icon && <ListItemIcon>{icon}</ListItemIcon>}
        <ListItemText primary={title} />
        {isOpen ? <ExpandLess /> : <ExpandMore />}
      </ListItem>
      <Collapse in={isOpen} timeout="auto" unmountOnExit>
        <ListItem>{children}</ListItem>
      </Collapse>
    </>
  );
};

export const Sidebar: React.FC = React.memo(() => {
  return (
    <List component="nav" className={styles.list}>
      <CollapsibleItem icon={<InfoIcon />} title="Paper Details">
        <Info />
      </CollapsibleItem>
      <CollapsibleItem icon={<AccountTreeIcon />} title="Sections">
        <PaperSections />
      </CollapsibleItem>
    </List>
  );
});

Sidebar.displayName = 'Sidebar';
