# -*- coding: utf-8 -*-

from __future__ import unicode_literals

from pyramid import security
import pytest

from h.api.models.annotation import Annotation
from h.api.models.document import Document, DocumentURI


annotation_fixture = pytest.mark.usefixtures('annotation')


@annotation_fixture
def test_document(annotation, db_session):
    document = Document(document_uris=[DocumentURI(claimant=annotation.target_uri,
                                                   uri=annotation.target_uri)])
    db_session.add(document)
    db_session.flush()

    assert annotation.document == document


@annotation_fixture
def test_document_not_found(annotation, db_session):
    document = Document(document_uris=[DocumentURI(claimant='something-else',
                                                   uri='something-else')])
    db_session.add(document)
    db_session.flush()

    assert annotation.document is None


def test_parent_id_of_direct_reply():
    ann = Annotation(references=['parent_id'])

    assert ann.parent_id == 'parent_id'


def test_parent_id_of_reply_to_reply():
    ann = Annotation(references=['reply1', 'reply2', 'parent_id'])

    assert ann.parent_id == 'parent_id'


def test_parent_id_of_annotation():
    ann = Annotation()

    assert ann.parent_id is None


def test_acl_private():
    ann = Annotation(shared=False, userid='saoirse')
    actual = ann.__acl__()
    expect = [(security.Allow, 'saoirse', 'read'),
              (security.Allow, 'saoirse', 'admin'),
              (security.Allow, 'saoirse', 'update'),
              (security.Allow, 'saoirse', 'delete'),
              security.DENY_ALL]
    assert actual == expect


def test_acl_world_shared():
    ann = Annotation(shared=True, userid='saoirse', groupid='__world__')
    actual = ann.__acl__()
    expect = [(security.Allow, security.Everyone, 'read'),
              (security.Allow, 'saoirse', 'admin'),
              (security.Allow, 'saoirse', 'update'),
              (security.Allow, 'saoirse', 'delete'),
              security.DENY_ALL]
    assert actual == expect


def test_acl_group_shared():
    ann = Annotation(shared=True, userid='saoirse', groupid='lulapalooza')
    actual = ann.__acl__()
    expect = [(security.Allow, 'group:lulapalooza', 'read'),
              (security.Allow, 'saoirse', 'admin'),
              (security.Allow, 'saoirse', 'update'),
              (security.Allow, 'saoirse', 'delete'),
              security.DENY_ALL]
    assert actual == expect


def test_setting_extras_inline_is_persisted(db_session):
    """
    In-place changes to Annotation.extra should be persisted.

    Setting an Annotation.extra value in-place:

        my_annotation.extra['foo'] = 'bar'

    should be persisted to the database.

    """
    annotation = Annotation(userid='fred')
    annotation.extra = {}  # FIXME: There should be a default value for this.

    # Add the annotation to the db so that annotation.id gets generated.
    db_session.add(annotation)

    # We need to flush the db here so that the initial value of {} for
    # annotation.tags gets persisted, otherwise this test would never fail.
    db_session.flush()

    # Make an in-place change to annotation.extra.
    annotation.extra['foo'] = 'bar'

    # We need to commit the db session here so that the in-place change to
    # annotation.extra above would be lost if annotation.extra was a normal
    # dict. Without this commit() this test would never fail.
    db_session.commit()

    annotation = Annotation.query.get(annotation.id)

    assert annotation.extra == {'foo': 'bar'}


def test_deleting_extras_inline_is_persisted(db_session):
    """
    In-place changes to Annotation.extra should be persisted.

    Deleting an Annotation.extra value in-place should be persisted to the
    database.

    """
    annotation = Annotation(userid='fred')
    annotation.extra = {'foo': 'bar'}
    db_session.add(annotation)
    db_session.flush()

    del annotation.extra['foo']
    db_session.commit()
    annotation = Annotation.query.get(annotation.id)

    assert 'foo' not in annotation.extra


@pytest.fixture
def annotation(db_session):
    ann = Annotation(userid="testuser", target_uri="http://example.com")

    db_session.add(ann)
    db_session.flush()
    return ann
