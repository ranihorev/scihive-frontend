import { Button, Link, Typography } from '@material-ui/core';
import IconButton from '@material-ui/core/IconButton';
import EmailIcon from '@material-ui/icons/Email';
import GitHubIcon from '@material-ui/icons/GitHub';
import TwitterIcon from '@material-ui/icons/Twitter';
import cx from 'classnames';
import React from 'react';
import { Link as RouterLink } from 'react-router-dom';
import shallow from 'zustand/shallow';
import { LoginForm } from '../auth/LoginForm';
import baseStyles from '../base.module.scss';
import { useUserStore } from '../stores/user';
import { TopBar, TopBarButton } from '../topBar';
import BlueHiveBG from './images/blue_hive_bg.png';
import chromeLogo from './images/chrome_logo.png';
import collaborateImg from './images/Collaborate.gif';
import berkeley from './images/institutes_logos/berkeley.png';
import harvard from './images/institutes_logos/harvard.png';
import princeton from './images/institutes_logos/princeton.png';
import stanford from './images/institutes_logos/stanford.png';
import logoWhite from './images/logo_white.png';
import navigateImg from './images/Navigate.gif';
import organizeImg from './images/Organize.gif';

const FeatureText: React.FC<{ title: string; text: React.ReactElement }> = ({ text, title }) => {
  return (
    <div className="place-self-center text-center">
      <Typography className="font-medium text-xl md:text-2xl mb-2">{title}</Typography>
      <Typography variant="body1" className="leading-6">
        {text}
      </Typography>
    </div>
  );
};

const FeatureImg: React.FC<{ img: string; alt?: string }> = ({ img, alt = 'FeatureImg' }) => {
  return (
    <div className="place-self-center">
      <img className="border-solid border-1 border-main-color rounded-sm md:max-w-sm" src={img} alt="FeatureImg" />
    </div>
  );
};

const Feature: React.FC<{ className?: string }> = ({ className, children }) => {
  return (
    <div
      className={cx(
        'mb-16 last:mb-0 flex flex-col md:grid md:grid-cols-1 md:grid-cols-2 md:gap-x-6 space-y-6 md:space-y-0 w-full',
        className,
      )}
    >
      {children}
    </div>
  );
};

const Section: React.FC<{ className?: string; container?: boolean }> = ({ className, container, children }) => (
  <div className={container ? 'lg:container mx-auto' : undefined}>
    <div className={cx('flex flex-col justify-center items-center py-12 md:py-16 px-4 md:px-8', className)}>
      {children}
    </div>
  </div>
);

const Title: React.FC<{ className?: string; marginBottom?: string }> = ({
  className,
  marginBottom = 'mb-10',
  children,
}) => (
  <Typography variant="h4" className={cx('text-center', marginBottom, className)}>
    {children}
  </Typography>
);

const CHROME_EXTENSION_URL = 'https://chrome.google.com/webstore/detail/scihive/dijdhkcfdaocpepndegmbkgphbpomdai?hl=en';

export const Landing: React.FC = () => {
  const { isLoggedIn } = useUserStore(state => ({ isLoggedIn: state.status === 'loggedIn' }), shallow);
  return (
    <div className={baseStyles.fullScreen}>
      <TopBar
        rightMenu={
          isLoggedIn ? (
            <TopBarButton to="/library">Library</TopBarButton>
          ) : (
            <TopBarButton to="/discover">Discover</TopBarButton>
          )
        }
      />
      <div>
        <div className="flex justify-center items-center">
          <img src={BlueHiveBG} alt="Blue background" width="100%" />
          <Typography className="text-2xl md:text-4xl font-medium text-white absolute">
            Smarter Science Together
          </Typography>
        </div>

        <Section className="text-center" container>
          <Typography className="text-xl font-medium">
            SciHive is a free and open-source tool to collaboratively read papers.
          </Typography>
          <br />
          <Typography className="text-xl font-medium">
            Our mission is to leverage technology to accelerate the pace of research and scientific discovery.
          </Typography>
          <br />
        </Section>
        <Section className="bg-gray-100">
          <Title>Get Started</Title>
          <div className="px-4">
            {isLoggedIn ? (
              <div className="space-x-0 space-y-5 flex flex-col md:flex-row md:space-y-0 md:space-x-8 items-center justify-center">
                <Button variant="contained" color="primary" component={RouterLink} to="/upload">
                  Upload New Paper
                </Button>
                <Button variant="contained" color="primary" component={RouterLink} to="/library">
                  View Your Library
                </Button>
              </div>
            ) : (
              <LoginForm />
            )}
          </div>
        </Section>

        <Section container>
          <Title>Features</Title>

          <Feature>
            <FeatureText
              title="Collaborate"
              text={
                <>
                  Read the papers you care about collaboratively.
                  <br />
                  Add questions, comments, and highlights.
                </>
              }
            />
            <FeatureImg img={collaborateImg} />
          </Feature>

          <Feature className="flex-col-reverse space-y-reverse">
            <FeatureImg img={navigateImg} />
            <FeatureText
              title="Navigate"
              text={
                <>
                  Start navigating papers like a champ.
                  <br />
                  <br />
                  Access references by the click of a button, instead of searching the literature manually.
                  <br />
                  SciHive also generates a convenient table of contents and deciphers acronyms automatically for you.
                </>
              }
            />
          </Feature>

          <Feature>
            <FeatureText
              title="Organize"
              text={
                <>
                  SciHive lets you create your own papers library.
                  <br />
                  Organize papers in collections for easy and efficient access for yourself and your peers.
                </>
              }
            />
            <FeatureImg img={organizeImg} />
          </Feature>
        </Section>

        <Section className="bg-gray-100">
          <Title>Used by top scientists in top institutes</Title>
          <div className="grid grid-cols-4 gap-4">
            {[princeton, stanford, harvard, berkeley].map(item => (
              <img src={item} key={item} alt="Princeton" className="w-24 place-self-center" />
            ))}
          </div>
        </Section>

        <Section className="bg-main-color pb-0 md:pb-0 mb-8">
          <Title className="text-white" marginBottom="mb-4">
            Chrome extension
          </Title>
          <Typography variant="h5" className="text-white text-center">
            Load any PDF paper into your SciHive library with one click
          </Typography>
          <Button
            variant="contained"
            className="my-8"
            href={CHROME_EXTENSION_URL}
            target="_blank"
            rel="noopener noreferrer"
          >
            Download Now
          </Button>
          <a href={CHROME_EXTENSION_URL} target="_blank" rel="noopener noreferrer">
            <img src={chromeLogo} alt="Chrome" className="h-32 md:h-40" />
          </a>
        </Section>

        <Section>
          <img src={logoWhite} alt="Logo" className="h-20" />
          <Typography variant="body1" className="mt-2">
            &copy; 2020 SciHive.Org
          </Typography>

          <div className="my-8 flex flex-row items-center space-x-8">
            <a href="mailto:hello@scihive.org" className="text-gray-500 hover:text-gray-800">
              <EmailIcon fontSize="large" />
            </a>
            <a
              href="https://twitter.com/SciHiveOrg"
              target="_blank"
              rel="noopener noreferrer"
              className="text-gray-500 hover:text-gray-800"
            >
              <TwitterIcon fontSize="large" />
            </a>
            <a
              href="https://github.com/ranihorev/scihive-frontend"
              target="_blank"
              rel="noopener noreferrer"
              className="text-gray-500 hover:text-gray-800"
            >
              <GitHubIcon fontSize="large" />
            </a>
          </div>
          <div>
            <Typography variant="body2" className="text-center">
              We are open source :)
              <br />
              Check out our{' '}
              <a
                href="https://github.com/ranihorev/scihive-frontend"
                target="_blank"
                rel="noopener noreferrer"
                className="hover:underline"
              >
                frontend
              </a>{' '}
              and{' '}
              <a
                href="https://github.com/ranihorev/scihive-backend"
                target="_blank"
                rel="noopener noreferrer"
                className="hover:underline"
              >
                backend
              </a>{' '}
              repos!
            </Typography>
          </div>

          <div className="mt-8 flex flex-col items-center space-y-4">
            <Link component={RouterLink} to="/privacy-policy" className="text-gray-800 text-sm">
              Privacy Policy
            </Link>
            <Link component={RouterLink} to="/terms-of-service" className="text-gray-800 text-sm">
              Terms of Service
            </Link>
          </div>
        </Section>
      </div>
    </div>
  );
};
