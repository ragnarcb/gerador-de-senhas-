from flask_wtf import FlaskForm
from wtforms import StringField, PasswordField, IntegerField, BooleanField, SubmitField
from wtforms.validators import DataRequired, Length, URL, Optional

class PasswordGeneratorForm(FlaskForm):
    length = IntegerField('Password Length', default=12, validators=[DataRequired()])
    include_uppercase = BooleanField('Include Uppercase Letters', default=True)
    include_lowercase = BooleanField('Include Lowercase Letters', default=True)
    include_numbers = BooleanField('Include Numbers', default=True)
    include_symbols = BooleanField('Include Symbols', default=True)
    submit = SubmitField('Generate Password')

class SavePasswordForm(FlaskForm):
    name = StringField('Name/Description', validators=[DataRequired(), Length(max=100)])
    password = PasswordField('Password', validators=[DataRequired(), Length(max=255)])
    website = StringField('Website', validators=[Optional(), URL(), Length(max=255)])
    username = StringField('Username/Email', validators=[Optional(), Length(max=100)])
    submit = SubmitField('Save Password') 