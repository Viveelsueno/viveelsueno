const fetch = window.fetch || (() => ({
  then: () => ({
    then: () => {}
  })
}));
const isExternalLink = ($this) => {
  const url = $this.getAttribute('href');
  const host = window.location.hostname.toLowerCase();
  const regex = new RegExp('^(?:(?:f|ht)tp(?:s)?\:)?//(?:[^\@]+\@)?([^:/]+)', 'im');
  const match = url.match(regex);
  const domain = ((match ? match[1].toString() : ((url.indexOf(':') < 0) ? host : ''))).toLowerCase();
  return domain !== host;
};
const BUSINESS_SEARCH_INDEX_LOADED = 'ves.business_search_index_loaded';
const CURRENT_LANGUAGE = document.querySelector('html').getAttribute('lang');
const getLanguagePrefix = (language) => ['/es', ''][['es', 'en'].indexOf(language)];
const getCurrentLanguagePrefix = () => getLanguagePrefix(CURRENT_LANGUAGE);

import 'regenerator-runtime/runtime';
import { Search } from 'js-search';
// import preact from 'preact';
import $ from 'jquery';

$(document).ready(() => {
  const $root = $('html, body');
  const $flyout = $('.nav__flyout');
  const $navMain = $('.nav__main');
  const now = new Date();
  let nVisibleEvents = 0;

  $('.event__teaser').each(function() {
    const $this = $(this);
    const dateString = $this.data('date');
    const date = new Date(Date.parse(dateString));

    if (date > now) {
      nVisibleEvents++;
      $this.show();
    }
  });

  if (nVisibleEvents === 0) {
    $('.events').hide();
  }

  $('a').each(function() {
    const $this = $(this);
    if (isExternalLink(this)) {
      $this.addClass('js-outbound-link');
      $this.attr('target', '_blank');
    }
  });

  let externalClickRealized = false;
  $(document).on('click', 'a', function(event) {
    const $link = $(event.target).closest('a')[0];
    if (isExternalLink($link)) {
      event.preventDefault();
      externalClickRealized = false;
      function clickLink() {
        if (!externalClickRealized) {
          window.open($link.getAttribute('href'), '_blank');
          externalClickRealized = true;
        }
      }
      setTimeout(clickLink, 1000);

      window.gtag = window.gtag || function() {};
      window.gtag('event', 'Outbound Link Click', {
        'event_callback': function() { clickLink(); },
        'event_category': 'Link',
        'event_label': `Click ${$(event.target).attr('href')}`
      });
    }
  });

  let donateFormSubmissionTracked = false;
  $('#form-donate').submit(function(e) {
    if (donateFormSubmissionTracked === false) {
      e.preventDefault();
      const $this = $(this);

      function submitForm() {
        if (!donateFormSubmissionTracked) {
          donateFormSubmissionTracked = true;
          $this.submit();
        }
      }
      setTimeout(submitForm, 1000);

      // Track conversion
      const $radio = $('input[name="amount"]:checked', $this);
      const donationAmount = $radio.val();
      const donationLabel = $radio.siblings('.donate__donation-amount-label').first().text();
      window.gtag = window.gtag || function() {};
      window.gtag('event', 'Donate', {
        'event_callback': function() {
          submitForm();
        },
        'event_category': 'Conversions',
        'event_label': `Submit #form-donate - ${donationLabel === '...' ? 'other' : donationLabel}`,
        'value': donationAmount ? donationAmount : null,
      });
    }
  });

  let subscribeFormSubmissionTracked = false;
  $('#form-newsletter-subscribe').submit(function(e) {
    if (subscribeFormSubmissionTracked === false) {
      e.preventDefault();
      const $this = $(this);

      setTimeout(submitForm, 1000);
      function submitForm() {
        if (!subscribeFormSubmissionTracked) {
          subscribeFormSubmissionTracked = true;
          $this.submit();
        }
      }

      // Track conversion
      window.gtag = window.gtag || function() {};
      window.gtag('event', 'Subscribe', {
        'event_callback': function() {
          submitForm();
        },
        'event_category': 'Conversions',
        'event_label': 'Subscribe to newsletter',
      });
    }
  });

  const buildInstagramFeed = () => {
    fetch('/instagram.json')
    .then((r) => r.json())
    .then((j) => j.sources.slice(0, 6).forEach((image) => {
      $('.socials__instagram-feed').append(
        $('<a/>', {
          class: 'socials__instagram-photo',
          href: image.link,
          target: '_blank'
        }).css({
          backgroundImage: 'url(' + image.src + ')'
        }));
    }));
  };
  buildInstagramFeed();

  const smoothScrollingTo = (target) => {
    const $target = $(target);

    if ($target.length) {
      $root.animate({scrollTop:$(target).offset().top}, 500, 'swing', () => {
        location.hash = target;
      });
    }
  };

  if (location.hash)
    smoothScrollingTo(location.hash);

  $(document).on('click', 'a[href^=\\#]', function(event) {
    if ($(this.hash).length) {
      event.preventDefault();
      smoothScrollingTo(this.hash);
    }
  });

  $('.nav__flyout-open, .nav__flyout-close').click(() => {
    if ($flyout.is('.nav__flyout--active')) {
      $flyout
      .removeClass('nav__flyout--active')
      .attr('tabindex', '-1')
      .delay(400)
      .hide(0);
      $navMain
      .animate({
        opacity: 1,
      }, 300);
    } else {
      $flyout
      .show(0)
      .delay(100)
      .addClass('nav__flyout--active')
      .attr('tabindex', '0');
      $navMain
      .animate({
        opacity: .5,
      }, 300);
    }
  });

  $('.nav__flyout-link').click(() => {
    $flyout
    .removeClass('nav__flyout--active')
    .attr('tabindex', '-1')
    .delay(400)
    .hide(0);
    $navMain
    .animate({
      opacity: 1,
    }, 300);
  });

  $('.js-input-placeholder .js-input-placeholder__input').focus((e) => {
    $(e.target).parent('.js-input-placeholder').addClass('js-input-placeholder--active');
  });

  $('.js-input-placeholder .js-input-placeholder__input').blur((e) => {
    if (!$(e.target).val()) {
      $(e.target).parent('.js-input-placeholder').removeClass('js-input-placeholder--active');
    }
  });

  $('#form-newsletter-subscribe').submit((e) => {
    e.preventDefault();
    $.post(
      'https://wt-07ecda8053e9157184aef4084d1d2126-0.sandbox.auth0-extend.com/mailchimp-subscribe'
    , {
      email: $(e.target).find('input[name="email"]').val()
    }, (response) => {
      if (response.status === 200) {
        const responseText = $('<p></p>').text('Thank you for subscribing to our newsletter.');
        $('#form-newsletter-subscribe').replaceWith(responseText);
      } else {
        $('#form-newsletter-subscribe .socials__email-input').css({
          outline: '2px solid #b54545'
        });
      }
    }, 'json');
  });

  const applySearchResults = ($results, results) => {
    $results.html(
      results.slice(0, 3).map((result) => (
        `<div class="businesses__business-teaser">
          <a target="_blank" class="businesses__business-link" href="${result.url}">
            <img src="${result.business_logo}" class="businesses__business-logo" />
            <div class="businesses__business-info">
              <div class="businesses__business-sector">${result.business_sector}</div>
              <div class="businesses__business-name">${result.business_name}</div>
              <div class="businesses__business-location">
                <span class="businesses__business-location-icon"></span>
                ${result.location}
              </div>
            </div>
          </a>
        </div>`
      )).join('') +
      `<a href="${getCurrentLanguagePrefix()}/participant" class="businesses__see-all">
        ${CURRENT_LANGUAGE === 'en' ? 'see all businesses' : 'ver todos los negocios'}
       </a>`
    );
  };

  $('#business-search-homepage').each(function() {
    const $this = $(this);
    document.addEventListener(BUSINESS_SEARCH_INDEX_LOADED, () => {
      const $input = $this.children('input').first();
      const $results = $this.children('#business-search-homepage-results').first();
      const currValue = $input.val();

      // Search the index if the user had typed
      // something in before the results loaded
      if (currValue !== '') {
        applySearchResults($results, window.BUSINESS_SEARCH_INDEX.search(currValue));
      } else {
        applySearchResults($results, window.BUSINESS_SEARCH_INDEX.search('Nosara'));
      }

      // Set the placeholder to real examples
      const businesses = window.BUSINESS_SEARCH_INDEX._documents;
      let businessExample;
      let sectorExample;
      let locationExample;
      try {
        businessExample = businesses[0].business_name;
        sectorExample = businesses[1].business_sector;
        locationExample = businesses[2].location;
      } catch (err) {}
      $input.attr('placeholder', `${
        CURRENT_LANGUAGE === 'es'
        ? 'p.ej.'
        : 'eg.'
      } ${sectorExample}, ${locationExample} ${
        CURRENT_LANGUAGE === 'es'
        ? 'o'
        : 'or'
      } ${businessExample}`);

      // Search the index after 250ms of no typing
      let timeout;
      $input.bind('keyup', () => {
        clearTimeout(timeout);
        timeout = setTimeout(() => {
          let newValue = $input.val();
          newValue = newValue || 'Nosara';
          const results = window.BUSINESS_SEARCH_INDEX.search(newValue);
          applySearchResults($results, results);
        }, 250);
      });
    });
  });

  const fetchSearchableBusinesses = async () => {
    try {
      const response = await fetch(`${getCurrentLanguagePrefix()}/participant/index.json`);
      const json = await response.json();

      window.BUSINESS_SEARCH_INDEX = new Search('id');
      window.BUSINESS_SEARCH_INDEX.addIndex('location');
      window.BUSINESS_SEARCH_INDEX.addIndex('business_sector');
      window.BUSINESS_SEARCH_INDEX.addIndex('business_name');
      window.BUSINESS_SEARCH_INDEX.addDocuments(json.businesses);
      document.dispatchEvent(new CustomEvent(BUSINESS_SEARCH_INDEX_LOADED));
    } catch (err) {}
  };
  fetchSearchableBusinesses();
});
