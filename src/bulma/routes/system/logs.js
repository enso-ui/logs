import routeImporter from '@enso-ui/ui/src/modules/importers/routeImporter';

const routes = routeImporter.fromGlob(import.meta.glob('./logs/*.js', { eager: true }));
const Router = () => import('@enso-ui/ui/src/bulma/pages/Router.vue');

export default {
    path: 'logs',
    component: Router,
    meta: {
        breadcrumb: 'logs',
        route: 'system.logs.index',
        keepAlive: false,
    },
    children: routes,
};
