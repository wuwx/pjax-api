/// <reference path=".d/jquery.d.ts"/>
/// <reference path=".d/jquery.pjax.d.ts"/>

interface Window {
  DOMParser?: any
  webkitIndexedDB?: IDBFactory
  mozIndexedDB?: IDBFactory
  IDBKeyRange?: IDBKeyRange
  webkitIDBKeyRange?: IDBKeyRange
  mozIDBKeyRange?: IDBKeyRange
  msIDBKeyRange?: IDBKeyRange
  opera?
}
interface JQueryXHR {
  follow: boolean
  host: string
  timeStamp: number
}
module MODULE {

  export var NAME: string = 'pjax'
  export var NAMESPACE: any = jQuery

  /*
   * 仕様
   * -----
   * 
   * 構成
   * 
   * Rayer:
   * - View
   * - Controller
   * - Model(mvc-interface)
   * - Model(application-rogic)
   * - Model(data-access)
   * 
   * Model:
   * - class ModelMain (mvc-interface)
   *   single instance(M)
   * - class ModelApp (application-logic)
   *   single instance(APP)
   * - class ModelData (data-access)
   *   single instance(DATA)
   * - class ModelUtil
   *   single instance(UTIL)
   * 
   * View
   * - class ViewMain (mvc-interface)
   *   multi instance
   * 
   * Controller
   * - class ControllerMain (mvc-interface)
   *   single instance(C)
   * - class ControllerFunction
   *   single instance
   * - class ControllerMethod
   *   single instance
   * 
   * -----
   * 
   * 規約
   * 
   * - MVCモジュール間のアクセスは各モジュールのインターフェイスを経由し、内部機能(APP/DATA)に直接アクセスしない。
   * - UTILはどこからでも自由に使用してよい。
   * - モデルインターフェイスへ渡されるデータはすべて正規化、検疫されてないものとして自身で正規化、検疫する。
   * - モデルのインターフェイスより下のレイヤーのメソッドは引数パターンの省略を除いて固定し、ポリモーフィズムやオーバーロードを使用しない。
   * - モデルインターフェイスもViewやControllerの機能の実体を実装するメソッドは同様とする。
   * 
   */
  // Model
  export declare class ModelInterface {
    constructor()
    // テンプレート
    NAME: string
    NAMESPACE: any

    // プロパティ
    state_: State
    isDeferrable: boolean
    requestHost: string
    
    // Model機能
    APP_: ModelApp
    main_(context: ContextInterface, option: PjaxSetting): ContextInterface
    state(): State
    convertUrlToKeyUrl(unsafe_url: string): string
    isImmediateLoadable(unsafe_url: string): boolean
    isImmediateLoadable(event: JQueryEventObject): boolean
    getActiveSetting(): SettingInterface
    setActiveSetting(setting: SettingInterface): SettingInterface
    getActiveXHR(): JQueryXHR
    setActiveXHR(xhr: JQueryXHR): JQueryXHR
    fallback(event: JQueryEventObject, setting: SettingInterface): void
    
    // View機能実体
    CLICK(event: JQueryEventObject): void
    SUBMIT(event: JQueryEventObject): void
    POPSTATE(event: JQueryEventObject): void
    SCROLL(event: JQueryEventObject, end: boolean): void
    
    // Controller機能実体
    enable(): void
    disable(): void
    getCache(unsafe_url: string): CacheInterface
    setCache(unsafe_url: string, data: string, textStatus: string, jqXHR: JQueryXHR, host?: string): any
    removeCache(unsafe_url: string): void
    clearCache(): void
    cleanCache(): void
  }
  export declare class ModelAppInterface {
    landing: string
    recent: RecentInterface
    activeXHR: JQueryXHR
    activeSetting: SettingInterface

    scope_(setting: SettingInterface, src: string, dst: string, rewriteKeyUrl?: string): any
    
    configure(option: SettingInterface, origURL: string, destURL: string): SettingInterface
    registrate($context: ContextInterface, setting: SettingInterface): void
    createHTMLDocument(html: string): Document
    chooseAreas(areas: string[], srcDocument: Document, dstDocument: Document): string
    enableBalance(host?: string): void
    disableBalance(): void
    switchRequestServer(host: string, setting: SettingInterface): void
    chooseRequestServer(setting: SettingInterface): void
    movePageNormally(event: JQueryEventObject): void
    scrollByHash(hash: string): boolean
    calAge(jqXHR: JQueryXHR): number
    calExpires(jqXHR: JQueryXHR): number
  }
  export declare class AppDataInterface {
    APP_: ModelApp
    DATA_: ModelData

    //cookie
    getCookie(key: string): string
    setCookie(key: string, value: string, option?: Object): string

    // db
    opendb(setting: SettingInterface, success: () => void): void
    storeNames: {
      meta: string
      history: string
      log: string
      server: string
    }
    
    // buffer
    getBuffer(storeName: string): Object
    getBuffer(storeName: string, key: string): any
    getBuffer(storeName: string, key: number): any
    setBuffer(storeName: string, key: string, value: Object, isMerge?: boolean): any
    loadBuffer(storeName: string, limit?: number): void
    saveBuffer(storeName: string): void
    loadBufferAll(limit?: number): void
    saveBufferAll(): void

    // meta

    // history
    loadTitleFromDB(unsafe_url: string): void
    saveTitleToDB(unsafe_url: string, title: string): void
    loadScrollPositionFromCacheOrDB(unsafe_url: string): void
    saveScrollPositionToCacheAndDB(unsafe_url: string, scrollX: number, scrollY: number): void

    // log
    loadLogFromDB(): void
    saveLogToDB(log: LogSchema): void

    // server
    loadServerFromDB(): void
    saveServerToDB(host: string, state?: number, unsafe_url?: string, expires?: number): void
  }
  export declare class AppUpdateInterface {
    constructor(APP: ModelApp, setting: SettingInterface, event: JQueryEventObject, register: boolean, cache: CacheInterface)

    APP_: ModelApp

    setting_: SettingInterface
    cache_: CacheInterface
    checker_: JQuery
    loadwaits_: JQueryDeferred<any>[]

    event_: JQueryEventObject
    data_: string
    textStatus_: string
    jqXHR_: JQueryXHR
    errorThrown_: string
    register_: boolean
    srcDocument_: Document
    dstDocument_: Document

    update_(): void
    updateRewrite_(): void
    updateCache_(): void
    updateRedirect_(): void
    updateUrl_(): void
    updateTitle_(): void
    updateHead_(): void
    updateContent_(): JQueryDeferred<any>[]
    updateScroll_(call: boolean): void
    updateCSS_(selector: string): void
    updateScript_(selector: string): void
    updateRender_(callback: () => void): void
    updateBalance_(): void
    updateVerify_(): void
    wait_(ms: number): JQueryPromise<any>
  }
  export declare class ModelDataInterface {
    DB: DataDB
    Cookie: DataCookie
  }
  export declare class DataDBInterface {

    IDBFactory: IDBFactory
    IDBKeyRange: IDBKeyRange

    database_: IDBDatabase
    name_: string
    version_: number
    refresh_: number
    upgrade_: number
    state_: State
    nowInitializing: boolean
    nowRetrying: boolean
    conAge_: number
    conExpires_: number
    conInterval_: number
    state(): State
    store: DatabaseSchema
    metaNames: {
      version: string
      update: string
    }
    
    initdb_(success: () => void, delay?: number): void
    checkdb_(database: IDBDatabase, version: number, success: () => void, upgrade: () => void): void;
    conExtend_(): void

    opendb(success: () => void, noRetry?: boolean): void
    closedb(): void
    deletedb(): void
  }
  export declare class DataStoreInterface<T> {
    constructor(DB: DataDBInterface)

    DB_: DataDB

    name: string
    keyPath: string

    buffer_: Object

    accessStore(success: (store?: IDBObjectStore) => void, mode?: string): void
    accessRecord(key: string, success: (event?: Event) => void, mode?: string): void

    loadBuffer(limit?: number): void
    saveBuffer(): void
    getBuffer(): Object
    getBuffer(key: string): Object
    getBuffer(key: number): Object
    setBuffer(value: T, isMerge?: boolean): Object
    addBuffer(value: any): Object
    
    add(value: T): void
    set(value: T): void
    get(key: number, success: (event: Event) => void): void
    get(key: string, success: (event: Event) => void): void
    del(key: number): void
    del(key: string): void
  }
  export declare class DataStoreMetaInterface<T> extends DataStoreInterface<T> {
  }
  export declare class DataStoreHistoryInterface<T> extends DataStoreInterface<T> {
    clean(): void
  }
  export declare class DataStoreLogInterface<T> extends DataStoreInterface<T> {
    clean(): void
  }
  export declare class DataStoreServerInterface<T> extends DataStoreInterface<T> {
  }
  export declare class DataCookieInterface {
    constructor(age: number)
    age_: number

    getCookie(key: string): string
    setCookie(key: string, value: string, option?: CookieOptionInterface): string
  }
  // View
  export declare class ViewInterface {
    constructor(context?: ContextInterface)
    CONTEXT: ContextInterface
    state_: State
    
    BIND(setting: SettingInterface): ViewInterface
    UNBIND(setting: SettingInterface): ViewInterface
    OBSERVE(): ViewInterface
    RELEASE(): ViewInterface
  }
  // Controller
  export declare class ControllerInterface {
    constructor()
    state_: State

    EXTEND(context: Object): Object
    EXEC(...args: any[]): any
    exec_(context: ContextInterface, ...args: any[]): any
    OBSERVE(): void
    
    CLICK(event: JQueryEventObject): void
    SUBMIT(event: JQueryEventObject): void
    POPSTATE(event: JQueryEventObject): void
  }
  export interface FunctionInterface {
    enable(): JQueryPjax
    disable(): JQueryPjax
    click(): JQueryPjax
    click(url: string, attr?: { href?: string; }): JQueryPjax
    click(url: HTMLAnchorElement, attr?: { href?: string; }): JQueryPjax
    click(url: JQuery, attr?: { href?: string; }): JQueryPjax
    submit(): JQueryPjax
    submit(url: string, attr: { action?: string; method?: string; }, data: any): JQueryPjax
    submit(url: HTMLFormElement, attr?: { action?: string; method?: string; }, data?: any): JQueryPjax
    submit(url: JQuery, attr?: { action?: string; method?: string; }, data?: any): JQueryPjax
    follow(event: JQueryEventObject, ajax: JQueryXHR): boolean
    setCache(): JQueryPjax
    setCache(url: string): JQueryPjax
    setCache(url: string, data: string): JQueryPjax
    setCache(url: string, data: string, textStatus: string, jqXHR: JQueryXHR): JQueryPjax
    getCache(): PjaxCache
    getCache(url: string): PjaxCache
    removeCache(url: string): JQueryPjax
    removeCache(): JQueryPjax
    clearCache(): JQueryPjax
    host(): string
  }
  export interface MethodInterface {
  }

  // enum
  export enum State { wait = -1, ready, lock, seal, error }

  // Parameter
  export interface SettingInterface {
    // public
    area: any
    link: string
    filter(): boolean
    form: string
    scope: {}
    rewrite: (document: Document, area: string, host: string) => void
    state: {}
    scrollTop: number
    scrollLeft: number
    ajax: JQueryAjaxSettings
    contentType: string
    cache: {
      click: boolean
      submit: boolean
      popstate: boolean
      get: boolean
      post: boolean
      limit: number
      size: number
      expires: {
        max: number
        min: number
      }
      mix: number
    }
    buffer: {
      limit: number
      delay: number
    }
    load: {
      sync: boolean
      head: string
      css: boolean
      script: boolean
      execute: boolean
      reload: string
      ignore: string
      ajax: JQueryAjaxSettings
    }
    balance: {
      self: boolean
      weight: number
      client: {
        support: {
          userAgent: RegExp
          redirect: RegExp
        }
        exclude: RegExp
        cookie: {
          balance: string
          redirect: string
          host: string
        }
      }
      server: {
        header: string
        filter: RegExp
        error: number
        host: string //internal
      }
      log: {
        expires: number
        limit: number
      }
      option: PjaxSetting
    }
    redirect: boolean
    interval: number
    wait: number
    scroll: {
      delay: number
      record: boolean //internal
      queue: number[] //internal
    }
    fix: {
      location: boolean
      history: boolean
      scroll: boolean
      reset: boolean
    }
    fallback: boolean
    database: boolean
    server: {
      query: any
      header: {
        area: boolean
        head: boolean
        css: boolean
        script: boolean
      }
    }
    callback(): any
    param: any
    callbacks: {
      before?: (event: JQueryEventObject, param: any) => any
      after?: (event: JQueryEventObject, param: any) => any
      ajax: {
        xhr?: (event: JQueryEventObject, param: any) => any
        beforeSend?: (event: JQueryEventObject, param: any, data: string, ajaxSettings: any) => any
        dataFilter?: (event: JQueryEventObject, param: any, data: string, dataType: any) => any
        success?: (event: JQueryEventObject, param: any, data: string, textStatus: string, jqXHR: JQueryXHR) => any
        error?: (event: JQueryEventObject, param: any, jqXHR: JQueryXHR, textStatus: string, errorThrown: any) => any
        complete?: (event: JQueryEventObject, param: any, jqXHR: JQueryXHR, textStatus: string) => any
        done?: (event: JQueryEventObject, param: any, data: string, textStatus: string, jqXHR: JQueryXHR) => any
        fail?: (event: JQueryEventObject, param: any, jqXHR: JQueryXHR, textStatus: string, errorThrown: any) => any
        always?: (event: JQueryEventObject, param: any, jqXHR: JQueryXHR, textStatus: string) => any
      }
      update: {
        before?: (event: JQueryEventObject, param: any, data: string, textStatus: string, jqXHR: JQueryXHR) => any
        after?: (event: JQueryEventObject, param: any, data: string, textStatus: string, jqXHR: JQueryXHR) => any
        rewrite: {
          before?: (event: JQueryEventObject, param: any, cache: any) => any
          after?: (event: JQueryEventObject, param: any, cache: any) => any
        }
        cache: {
          before?: (event: JQueryEventObject, param: any, cache: any) => any
          after?: (event: JQueryEventObject, param: any, cache: any) => any
        }
        redirect: {
          before?: (event: JQueryEventObject, param: any, data: string, textStatus: string, jqXHR: JQueryXHR) => any
          after?: (event: JQueryEventObject, param: any, data: string, textStatus: string, jqXHR: JQueryXHR) => any
        }
        url: {
          before?: (event: JQueryEventObject, param: any, data: string, textStatus: string, jqXHR: JQueryXHR) => any
          after?: (event: JQueryEventObject, param: any, data: string, textStatus: string, jqXHR: JQueryXHR) => any
        }
        title: {
          before?: (event: JQueryEventObject, param: any, data: string, textStatus: string, jqXHR: JQueryXHR) => any
          after?: (event: JQueryEventObject, param: any, data: string, textStatus: string, jqXHR: JQueryXHR) => any
        }
        head: {
          before?: (event: JQueryEventObject, param: any, data: string, textStatus: string, jqXHR: JQueryXHR) => any
          after?: (event: JQueryEventObject, param: any, data: string, textStatus: string, jqXHR: JQueryXHR) => any
        }
        content: {
          before?: (event: JQueryEventObject, param: any, data: string, textStatus: string, jqXHR: JQueryXHR) => any
          after?: (event: JQueryEventObject, param: any, data: string, textStatus: string, jqXHR: JQueryXHR) => any
        }
        scroll: {
          before?: (event: JQueryEventObject, param: any) => any
          after?: (event: JQueryEventObject, param: any) => any
        }
        css: {
          before?: (event: JQueryEventObject, param: any, data: string, textStatus: string, jqXHR: JQueryXHR) => any
          after?: (event: JQueryEventObject, param: any, data: string, textStatus: string, jqXHR: JQueryXHR) => any
        }
        script: {
          before?: (event: JQueryEventObject, param: any, data: string, textStatus: string, jqXHR: JQueryXHR) => any
          after?: (event: JQueryEventObject, param: any, data: string, textStatus: string, jqXHR: JQueryXHR) => any
        }
        render: {
          before?: (event: JQueryEventObject, param: any) => any
          after?: (event: JQueryEventObject, param: any) => any
        }
        verify: {
          before?: (event: JQueryEventObject, param: any) => any
          after?: (event: JQueryEventObject, param: any) => any
        }
        balance: {
          before?: (event: JQueryEventObject, param: any) => any
          after?: (event: JQueryEventObject, param: any) => any
        }
        success?: (event: JQueryEventObject, param: any, data: string, textStatus: string, jqXHR: JQueryXHR) => any
        error?: (event: JQueryEventObject, param: any, data: string, textStatus: string, jqXHR: JQueryXHR) => any
        complete?: (event: JQueryEventObject, param: any, data: string, textStatus: string, jqXHR: JQueryXHR) => any
      }
    }
    
    // internal
    uuid: string
    gns: string
    ns: string
    nss: {
      name: string
      event: string[]
      click: string
      submit: string
      popstate: string
      scroll: string
      data: string
      class4html: string
      requestHeader: string
    }
    origLocation: HTMLAnchorElement
    destLocation: HTMLAnchorElement
    loadtime: number
    retriable: boolean
    disable: boolean
    option: any
    speedcheck: boolean
  }

  // Member
  export interface ContextInterface extends JQuery { }
  export interface RecentInterface {
    order: string[]
    data: {
      [index: string]: CacheInterface
    }
    size: number
  }

  // Object
  export interface CacheInterface {
    jqXHR: JQueryXHR
    data: string
    textStatus: string
    size?: number
    expires?: number
    host?: string
    timeStamp?: number
  }
  export interface CookieOptionInterface {
    age: number
    path: string
    domain: string
    secure: boolean
  }

  // Database
  export interface DatabaseSchema {
    meta: DataStoreMeta<MetaSchema>
    history: DataStoreHistory<HistorySchema>
    log: DataStoreLog<LogSchema>
    server: DataStoreServer<ServerSchema>
  }
  export interface MetaSchema {
    id: string
    value: any
  }
  export interface HistorySchema {
    id: string      // url
    title: string   // fix
    date: number    // fix
    scrollX: number // fix
    scrollY: number // fix
    expires: number // blanace
    host: string    // balance
  }
  export interface LogSchema {
    host: string
    response: number
    date: number
  }
  export interface ServerSchema {
    id: string    // host
    state: number // 0:正常, !0:異常発生時刻(ミリ秒)
  }

}
