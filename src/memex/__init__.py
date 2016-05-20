# -*- coding: utf-8 -*-

__all__ = ('__version__',)
__version__ = '0.22.0+dev'


def includeme(config):
    config.include('memex.db')
    config.include('memex.eventqueue')
    config.include('memex.presenters')
    config.include('memex.search')
    config.include('memex.views')

    config.add_route('api.index', '/')
    config.add_route('api.annotations', '/annotations')
    config.add_route('api.annotation',
                     '/annotations/{id:[A-Za-z0-9_-]{20,22}}',
                     factory='memex.resources:AnnotationFactory',
                     traverse='/{id}')
    config.add_route('api.annotation.jsonld',
                     '/annotations/{id:[A-Za-z0-9_-]{20,22}}.jsonld',
                     factory='memex.resources:AnnotationFactory',
                     traverse='/{id}')
    config.add_route('api.search', '/search')
