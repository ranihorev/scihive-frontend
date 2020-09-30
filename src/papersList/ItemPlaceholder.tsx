/** @jsx jsx */
import { jsx } from '@emotion/core';
import { Card } from '@material-ui/core';
import { range } from 'lodash';
import React from 'react';
import ContentLoader from 'react-content-loader';
import { isMobile } from 'react-device-detect';
import styles from './styles.module.scss';

export const ItemPlaceholder: React.FC<{ count: number }> = React.memo(({ count }) => {
  return (
    <React.Fragment>
      {range(0, count).map(index => (
        <Card className={styles.placeholderCard} key={index}>
          <ContentLoader width="100%" viewBox={`0 0 ${isMobile ? '400' : '800'} 140`}>
            <rect x="0" y="0" rx="4" ry="4" width="100%" height="10" />
            <rect x="0" y="18" rx="4" ry="4" width="35%" height="10" />
            <rect x="0" y="46" rx="4" ry="4" width="10%" height="8" />
            <rect x="11%" y="46" rx="4" ry="4" width="10%" height="8" />
            <rect x="0" y="70" rx="4" ry="4" width="100%" height="1" />
            <rect x="0" y="90" rx="4" ry="4" width="100%" height="8" />
            <rect x="0" y="110" rx="4" ry="4" width="100%" height="8" />
            <rect x="0" y="130" rx="4" ry="4" width="90%" height="8" />
          </ContentLoader>
        </Card>
      ))}
    </React.Fragment>
  );
});
