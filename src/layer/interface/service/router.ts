import { route as router, Config, scope, RouterEvent, RouterEventType, RouterEventSource } from '../../application/router';
import { docurl } from './state/url';
import { env } from '../service/state/env';
//import { progressbar } from './progressbar';
import { FatalError } from '../../../lib/error';
import { loadTitle, savePosition } from '../../application/store';
import { URL, StandardURL, standardize } from 'spica/url';
import { Supervisor } from 'spica/supervisor.legacy';
import { Cancellation } from 'spica/cancellation';
import { Just } from 'spica/maybe';
import { bind, currentTargets } from 'typed-dom';

void bind(window, 'pjax:unload', () =>
  window.history.scrollRestoration = 'auto', true);

export { Config, RouterEvent, RouterEventSource }

export function route(
  config: Config,
  event: RouterEvent,
  process: Supervisor<'', Error>,
  io: {
    document: Document;
  }
): boolean {
  assert([HTMLAnchorElement, HTMLFormElement, Window].some(Class => event.source instanceof Class));
  switch (event.type) {
    case RouterEventType.click:
    case RouterEventType.submit:
      void savePosition();
      break;
    case RouterEventType.popstate:
      io.document.title = loadTitle();
      break;
  }
  return Just(0)
    .guard(validate(event.request.url, config, event))
    .bind(() =>
      scope(config, (({ orig, dest }) => ({ orig: orig.pathname, dest: dest.pathname }))(event.location)))
    .fmap(async config => {
      void event.original.preventDefault();
      void process.cast('', new Error(`Aborted.`));
      const cancellation = new Cancellation<Error>();
      const kill = process.register('', e => {
        void kill();
        void cancellation.cancel(e);
        return new Promise<never>(() => undefined);
      }, undefined);
      const [scripts] = await env;
      window.history.scrollRestoration = 'manual';
      //void progressbar(config.progressbar);
      return router(config, event, { process: cancellation, scripts }, io)
        .then(m => m
          .fmap(async ([ss, p]) => (
            void kill(),
            void docurl.sync(),
            void ss
              .filter(s => s.hasAttribute('src'))
              .forEach(s =>
                void scripts.add(new URL(standardize(s.src)).reference)),
            void (await p)
              .filter(s => s.hasAttribute('src'))
              .forEach(s =>
                void scripts.add(new URL(standardize(s.src)).reference))))
          .extract())
        .catch(reason => (
          void kill(),
          void docurl.sync(),
          window.history.scrollRestoration = 'auto',
          !cancellation.canceled || reason instanceof FatalError
            ? void config.fallback(currentTargets.get(event.original) as RouterEventSource, reason)
            : undefined));
    })
    .extract(
      () => {
        switch (event.type) {
          case RouterEventType.click:
          case RouterEventType.submit:
            break;
          case RouterEventType.popstate:
            if (!isHashChange(event.location.dest)) {
              void config.fallback(event.source, new Error(`Disabled.`));
              return true;
            }
            break;
        }
        void docurl.sync();
        return false;
      },
      () => true);
}

function validate(url: URL<StandardURL>, config: Config, event: RouterEvent): boolean {
  if (event.original.defaultPrevented) return false;
  switch (event.type) {
    case RouterEventType.click:
      assert(event.original instanceof MouseEvent);
      return isAccessible(url)
          && !isHashClick(url)
          && !isHashChange(url)
          && !isDownload(event.source as RouterEventSource.Anchor)
          && !hasModifierKey(event.original as MouseEvent)
          && config.filter(event.source as RouterEventSource.Anchor);
    case RouterEventType.submit:
      return isAccessible(url);
    case RouterEventType.popstate:
      return isAccessible(url)
          && !isHashChange(url);
    default:
      return false;
  }

  function isAccessible(dest: URL<StandardURL>): boolean {
    const orig: URL<StandardURL> = new URL(docurl.href);
    return orig.origin === dest.origin;
  }

  function isHashClick(dest: URL<StandardURL>): boolean {
    const orig: URL<StandardURL> = new URL(docurl.href);
    return orig.origin === dest.origin
        && orig.path === dest.path
        && dest.fragment !== '';
  }

  function isDownload(el: HTMLAnchorElement): boolean {
    return el.hasAttribute('download');
  }

  function hasModifierKey(event: MouseEvent): boolean {
    return event.which > 1
        || event.metaKey
        || event.ctrlKey
        || event.shiftKey
        || event.altKey;
  }
}
export { validate as _validate }

function isHashChange(dest: URL<StandardURL>): boolean {
  const orig: URL<StandardURL> = new URL(docurl.href);
  return orig.origin === dest.origin
      && orig.path === dest.path
      && orig.fragment !== dest.fragment;
}
