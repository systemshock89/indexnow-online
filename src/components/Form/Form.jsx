import { useState } from 'react';
import { TextField, Button, Alert, Paper, Box, Typography } from '@mui/material';
import './Form.scss';

function Form() {
    const [inputText, setInputText] = useState('');
    const [textarea, setTextarea] = useState('');
    const [message, setMessage] = useState('');
    const [messageType, setMessageType] = useState('');
    const [error, setError] = useState({ inputText: '', textarea: '' });
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [showAlert, setShowAlert] = useState(false);

    const isValidUrl = (url) => {
        try {
            new URL(url);
            return true;
        } catch (e) {
            return false;
        }
    };

    const validateForm = () => {
        const newError = { inputText: '', textarea: '' };
        let formIsValid = true;

        if (!inputText) {
            newError.inputText = 'Пожалуйста, введите ключ для верификации.';
            formIsValid = false;
        }

        if (!textarea) {
            newError.textarea = 'Пожалуйста, введите хотя бы одну ссылку.';
            formIsValid = false;
        } else {
            const urls = textarea.split('\n').map((url) => url.trim()).filter(Boolean);
            const invalidUrls = urls.filter((url) => !isValidUrl(url));
            if (invalidUrls.length > 0) {
                newError.textarea = 'Некоторые ссылки имеют неправильный формат.';
                formIsValid = false;
            }
        }

        setError(newError);
        return formIsValid;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!validateForm() || isSubmitting) {
            setShowAlert(false);  // скрываем alert при ошибке валидации
            return;
        }

        setIsSubmitting(true);
        setShowAlert(false);  // Скрываем ошибку, если форма валидна, но еще не отправлена

        const urls = textarea.split('\n').map((url) => url.trim()).filter(Boolean);
        const host = urls[0] ? new URL(urls[0]).hostname : '';

        const data = {
            host,
            key: inputText,
            urlList: urls,
        };

        try {
            const response = await fetch('https://mastweb.ru/classes/IndexNowProxy.php', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'charset': 'utf-8',
                    'Cache-Control': 'no-cache',
                },
                body: JSON.stringify(data),
            });

            const result = await response.json();

            // Обрабатываем ответ
            if (result.success) {
                setMessage('Отправка произошла успешно');
                setMessageType('success');

                // Очищаем форму после успешной отправки
                setInputText('');
                setTextarea('');
                setError({ inputText: '', textarea: '' });
            } else {
                setMessage(`Ошибка при отправке: ${JSON.stringify(result.message)}`);
                setMessageType('error');
            }
        } catch (error) {
            setMessage(`Ошибка при отправке: ${error.message}`);
            setMessageType('error');
            setError({ inputText: '', textarea: '' });
        } finally {
            setIsSubmitting(false);
            setShowAlert(true);  // Показываем alert после отправки
        }
    };

    const handleFocus = (field) => {
        setError((prevState) => ({ ...prevState, [field]: '' }));
    };

    const renderAlert = () => {
        if (showAlert && message) {  // Показать alert только если showAlert === true
            return (
                <div style={{ marginTop: '20px' }}>
                    <Alert severity={messageType} sx={{ width: '100%' }}>
                        {message}
                    </Alert>
                </div>
            );
        }
        return null;
    };

    return (
        <Box sx={{ display: 'flex', justifyContent: 'center', padding: 4, marginTop: 4 }}>
            <Paper sx={{ padding: 4, width: 850, boxShadow: 3 }}>
                <Typography variant="h5" gutterBottom align="center">
                    Отправка ссылок в IndexNow онлайн
                </Typography>
                <form onSubmit={handleSubmit}>
                    <TextField
                        label="Ключ для верификации пользователя"
                        variant="outlined"
                        fullWidth
                        margin="normal"
                        value={inputText}
                        onChange={(e) => setInputText(e.target.value)}
                        error={!!error.inputText}
                        helperText={error.inputText}
                        onFocus={() => handleFocus('inputText')}
                    />
                    <TextField
                        label="Ссылки одного домена"
                        variant="outlined"
                        fullWidth
                        margin="normal"
                        multiline
                        minRows={4}
                        maxRows={25}
                        value={textarea}
                        onChange={(e) => setTextarea(e.target.value)}
                        error={!!error.textarea}
                        helperText={error.textarea}
                        placeholder="https://www.example.com/url1"
                        onFocus={() => handleFocus('textarea')}
                    />
                    <Button
                        type="submit"
                        variant="contained"
                        color="primary"
                        fullWidth
                        sx={{ marginTop: 2, width: 220 }}
                    >
                        Отправить
                    </Button>

                    {renderAlert()}
                </form>
            </Paper>
        </Box>
    );
}

export default Form;
