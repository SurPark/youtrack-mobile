import Router from './router';

describe('Router', () => {
  let navigatorMock;

  beforeEach(() => {
    navigatorMock = {
      dispatch: jest.fn(),
    };
    Router.setNavigator(navigatorMock);
  });

  describe('Singleton', () => {
    beforeEach(() => {
      navigatorMock = {};
    });

    it('should create a Singleton', () => {
      expect(Router).toBeDefined();
    });

    it('should set an instance', () => {
      Router.setNavigator(navigatorMock);

      expect(Router._navigator).toEqual(navigatorMock);
    });
  });


  describe('Routes', () => {
    const routeNameMock = 'foo';
    const componentNameMock = 'bar';
    const propsMock = 'prop';

    it('should register route', () => {
      const modalParamMock = true;
      const propNameMock = 'someProp';

      Router.registerRoute({
        name: routeNameMock,
        component: {barr: componentNameMock},
        modal: modalParamMock,
        props: {[propNameMock]: propsMock},
      });

      expect(Router.routes.foo.screen).toBeDefined();
      expect(Router.routes.foo.modal).toEqual(modalParamMock);
      expect(Router.routes.foo.props[propNameMock]).toEqual(propsMock);
    });

    describe('Navigation', () => {
      it('should allow to call route', () => {
        Router.registerRoute({
          name: routeNameMock,
          component: {barr: componentNameMock},
          animation: 'fake-animation',
        });

        Router.foo();

        expect(navigatorMock.dispatch).toHaveBeenCalled();
      });

      it('should navigate', () => {
        Router.registerRoute({
          name: routeNameMock,
        });

        Router.navigate(routeNameMock);

        expect(navigatorMock.dispatch).toHaveBeenCalled();
      });
    });
  });


  describe('Dispatch callbacks', () => {
    let callback;
    beforeEach(() => {
      callback = jest.fn();
      Router.setOnDispatchCallback(callback);
    });

    it('should set on dispatch callback', () => {
      expect(Router.onDispatchCallbacks).toHaveLength(1);
      expect(Router.onDispatchCallbacks[0]).toEqual(callback);
    });

    it('should invoke a callback on dispatch', () => {
      const routeNameMock = 'mainROOT';
      const routeNameMock2 = 'mainROOT';
      const prevRouteNameMock = undefined;
      const options = undefined;

      Router.registerRoute({name: routeNameMock});
      Router.registerRoute({name: routeNameMock2});
      Router.navigate(routeNameMock);

      expect(callback).toHaveBeenCalledWith(
        routeNameMock,
        prevRouteNameMock,
        options
      );
    });
  });

});
