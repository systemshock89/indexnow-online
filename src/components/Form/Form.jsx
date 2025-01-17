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

        if (!validateForm() || isSubmitting) return;

        setIsSubmitting(true);

        const urls = textarea.split('\n').map((url) => url.trim()).filter(Boolean);
        const host = urls[0] ? new URL(urls[0]).hostname : '';

        const data = {
            host,
            key: inputText,
            urlList: urls,
        };

        try {
            const response = await fetch('https://mastweb.ru/classes/IndexNowProxy.php', {
            // const response = await fetch('https://yandex.com/indexnow', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'charset': 'utf-8',
                },
                body: JSON.stringify(data),
            });

            // Ответ от сервера
            const result = await response.json();
            setMessage(`Ответ от сервера: ${JSON.stringify(result)}`);
            setMessageType('success');

            setInputText('');
            setTextarea('');
            setError({ inputText: '', textarea: '' });
        } catch (error) {
            setMessage(`Ошибка при отправке: ${error.message}`);
            setMessageType('error');
            setError({ inputText: '', textarea: '' });
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleFocus = (field) => {
        setError((prevState) => ({ ...prevState, [field]: '' }));
    };

    const renderAlert = () => {
        if (message) {
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
