from backend.models.db import Assessment, Concept, Course, Misconception, Question, Topic, User, UserMisconception
from services.assessment.select import next_question


def test_selector_serves_discriminating_question(db_session) -> None:
    user = User(email="selector-misconception@example.com")
    course = Course(owner=user, title="Selector course")
    topic = Topic(course=course, name="Topic")
    concept = Concept(topic=topic, name="Concept")
    misconception = Misconception(concept=concept, course_id=course.id, label="Confusion", description="Mixes concepts")
    regular = Question(concept=concept, question_text="Regular", question_type="mcq", correct_answer="a", explanation="x", status="approved")
    targeted = Question(concept=concept, question_text="Targeted", question_type="mcq", correct_answer="a", explanation="x", status="approved", options=[{"key": "b", "text": "distractor", "misconception_id": "placeholder"}])
    db_session.add_all([user, course, topic, concept, misconception])
    db_session.flush()
    targeted.options = [{"key": "b", "text": "distractor", "misconception_id": misconception.id}]
    db_session.add_all([regular, targeted])
    db_session.flush()
    db_session.add(UserMisconception(user_id=user.id, misconception_id=misconception.id, severity=2, status="active"))
    assessment = Assessment(course_id=course.id, user_id=user.id, title="Quiz", question_ids=[], config={"concept_ids": [concept.id], "scope": [], "total": 1, "served_ids": []})
    db_session.add(assessment)
    db_session.commit()
    result = next_question(assessment.id, db_session)
    assert result["question"].id == targeted.id
    assert result["misconception_active"] is True
