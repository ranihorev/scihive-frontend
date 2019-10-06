/** @jsx jsx */
import { css, jsx } from '@emotion/core';
import Grid from '@material-ui/core/Grid';
import React from 'react';
import TweetEmbed from 'react-tweet-embed';
import PrimaryAppBar from '../components/TopBar/PrimaryAppBar';

const otherProjects = [
  'Arxiv-Sanity.com',
  'FermatsLibrary.com',
  'SemanticScholar.org',
  'scholar.google.com',
  'BenchSci.com',
  'arXiv.org',
  'biorxiv.org',
  'Mendeley.com',
  'ReadCube.com',
  'Authorea.com',
  'Overleaf.com',
  'ShareLatex.com',
  'MathPix.com',
  'Meta.org',
  'PubPeer.com',
  'OpenReview.net',
  'PeerLibrary.org',
  'arxiv-vanity.com',
  'Quora.com',
  'GroundAI.com',
];

const About: React.FC = () => {
  return (
    <React.Fragment>
      <PrimaryAppBar />
      <Grid
        container
        css={css`
          max-width: 992px;
          padding: 20px;
          line-height: 1.8;
          font-size: 16px;
          margin: auto;
          .twitter-tweet {
            max-width: 500px !important;
            width: 100% !important;
          }
        `}
      >
        <Grid container direction="row" justify="center">
          <Grid item>
            <div>
              <p>Welcome,</p>

              <p>
                Scientific research has gone a long way since the scientific revolution started in the 16th century.
                While many processes like peer reviewed publications are finally streamlined, a significant part of
                research endeavors suffers from inefficiencies. These inefficiencies, if addressed, can accelerate the
                rate, quality and novelty of scientific discoveries.
              </p>

              <p>
                SciHive is a free,{' '}
                <a href="https://github.com/ranihorev/scihive-frontend" target="_blank" rel="noopener noreferrer">
                  open-source
                </a>{' '}
                tool that is built by researchers for researchers.
              </p>

              <p>
                Our mission is to leverage technology to accelerate the pace of research and scientific progress. If you
                would like to join our team or suggest feedback, please email us at hello(@)scihive.org.
              </p>

              <p>Curiousity starts here.</p>

              <TweetEmbed id="1131580388449480706" options={{ cards: 'hidden', align: 'center' }} />

              <h4 style={{ marginTop: 40, marginBottom: 5 }}>Credits</h4>
              <small>
                <div>
                  SciHive was initially forked from{' '}
                  <a href="http://www.arxiv-sanity.com" target="_blank" rel="noopener noreferrer">
                    Arxiv-Sanity.com
                  </a>{' '}
                  by Andrej Karpathy
                </div>
                <div>
                  Github links are provided by{' '}
                  <a href="https://www.paperswithcode.com" target="_blank" rel="noopener noreferrer">
                    PapersWithCode
                  </a>
                </div>
              </small>

              <h4 style={{ paddingTop: 20, marginBottom: 5 }}>Other cool research-related projects</h4>

              {otherProjects.map((name, idx) => (
                <div key={idx}>
                  <small>
                    <a href={`http://${name}`} target="_blank" rel="noopener noreferrer">
                      {name}
                    </a>
                  </small>
                </div>
              ))}
              <div>Icons: add list by Nirbhay from the Noun Project</div>
            </div>
          </Grid>
        </Grid>
      </Grid>
    </React.Fragment>
  );
};

export default About;
