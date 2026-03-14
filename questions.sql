INSERT INTO questionnaire_questions
(id, text, type, options, left_label, right_label, sort_order)
VALUES ('q1',
'Which hobbies or interests would you find most attractive in a partner?',
'multi_choice',
'["Gaming","Working out","Playing sports","Fashion","Music","Art","Dancing"]',
NULL, NULL, 1);

INSERT INTO questionnaire_questions
(id, text, type, options, left_label, right_label, sort_order)
VALUES ('q2', 'Pick your ideal first date:', 'choice',
'["Late night drinking","Study date","Meet at cafe","Cook together"]',
NULL, NULL, 2);

INSERT INTO questionnaire_questions
(id, text, type, options, left_label, right_label, sort_order)
VALUES ('q3', 'What''s your social energy?', 'scale',
NULL, 'Introvert', 'Extrovert', 3);

INSERT INTO questionnaire_questions
(id, text, type, options, left_label, right_label, sort_order)
VALUES ('q4', 'The way to my heart is:', 'choice',
'["Giving me attention","Music / playlists","Make me laugh","Physical affection","Thoughtful gestures"]',
NULL, NULL, 4);

INSERT INTO questionnaire_questions
(id, text, type, options, left_label, right_label, sort_order)
VALUES ('q5', 'My biggest ick is:', 'multi_choice',
'["Bad texting","Being late","No eye contact","Talking about exes"]',
NULL, NULL, 5);

INSERT INTO questionnaire_questions
(id, text, type, options, left_label, right_label, sort_order)
VALUES ('q6', 'Are you a freak?', 'scale',
NULL, 'No', 'Yes', 6);

INSERT INTO questionnaire_questions
(id, text, type, options, left_label, right_label, sort_order)
VALUES ('q7', 'On a Friday night, you''ll find me:', 'choice',
'["Going out","Studying","Gaming","Rotting in bed","With my situationship"]',
NULL, NULL, 7);

INSERT INTO questionnaire_questions
(id, text, type, options, left_label, right_label, sort_order)
VALUES ('q8', 'How flirty are you in person?', 'scale',
NULL, 'Shy & subtle', 'Smooth operator', 8);

INSERT INTO questionnaire_questions
(id, text, type, options, left_label, right_label, sort_order)
VALUES ('q9', 'Pick a love language:', 'choice',
'["Words of affirmation","Quality time","Acts of service","Physical touch"]',
NULL, NULL, 9);

INSERT INTO questionnaire_questions
(id, text, type, options, left_label, right_label, sort_order)
VALUES ('q10', 'How important is texting back fast?', 'scale',
NULL, 'Whenever', 'Instant reply', 10);
