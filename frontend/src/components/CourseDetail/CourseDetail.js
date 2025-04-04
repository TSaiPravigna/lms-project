import React, { useState, useEffect } from 'react';
import './CourseDetail.css';

const CourseDetail = ({ course }) => {
    const [currentLesson, setCurrentLesson] = useState(null);
    const [lessons, setLessons] = useState([]);
    const [videoError, setVideoError] = useState('');

    useEffect(() => {
        if (course && course.lessons) {
            setLessons(course.lessons);
            if (course.lessons.length > 0) {
                setCurrentLesson(course.lessons[0]);
            }
        }
    }, [course]);

    // Add early return if course is undefined
    if (!course) {
        return <div className="course-detail-error">Loading course details...</div>;
    }

    const handleLessonSelect = (lesson) => {
        setCurrentLesson(lesson);
    };

    const getEmbedUrl = (url) => {
        if (!url) {
            console.error('No video URL provided');
            setVideoError('No video URL provided');
            return '';
        }

        try {
            console.log('Processing video URL:', url);
            
            // Handle YouTube URLs
            if (url.includes('youtube.com') || url.includes('youtu.be')) {
                const videoId = url.match(/(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/)?.[1];
                
                if (videoId) {
                    console.log('Detected YouTube video ID:', videoId);
                    return `https://www.youtube.com/embed/${videoId}?rel=0&showinfo=0&autoplay=0`;
                }
                
                console.error('Invalid YouTube URL format:', url);
                setVideoError('Invalid YouTube URL format');
                return '';
            }
            
            // Handle Vimeo URLs
            if (url.includes('vimeo.com')) {
                const videoId = url.match(/(?:vimeo\.com\/|video\/)(\d+)/)?.[1];
                
                if (videoId) {
                    console.log('Detected Vimeo video ID:', videoId);
                    return `https://player.vimeo.com/video/${videoId}`;
                }
                
                console.error('Invalid Vimeo URL format:', url);
                setVideoError('Invalid Vimeo URL format');
                return '';
            }
            
            // Handle direct video file URLs
            if (url.match(/\.(mp4|webm|ogg)$/i)) {
                console.log('Detected direct video file:', url);
                return url;
            }
            
            // If URL doesn't match any known format, try to use it as is
            console.log('Using URL as is:', url);
            return url;
        } catch (error) {
            console.error('Error processing video URL:', error);
            setVideoError('Error processing video URL');
            return '';
        }
    };

    return (
        <div className="course-detail">
            <div className="course-header">
                <h1>{course.title}</h1>
                <p className="course-description">{course.description}</p>
                <div className="course-meta">
                    <span className="instructor">Instructor: {course.instructor?.firstName} {course.instructor?.lastName}</span>
                    <span className="level">Level: {course.level}</span>
                </div>
            </div>

            <div className="course-content">
                <div className="video-player">
                    {currentLesson ? (
                        <>
                            <h2>{currentLesson.title}</h2>
                            <div className="video-container">
                                {videoError ? (
                                    <div className="video-error">
                                        <p>{videoError}</p>
                                    </div>
                                ) : currentLesson.videoUrl?.match(/\.(mp4|webm|ogg)$/i) ? (
                                    <video
                                        controls
                                        width="100%"
                                        height="100%"
                                        src={currentLesson.videoUrl}
                                    >
                                        Your browser does not support the video tag.
                                    </video>
                                ) : (
                                    <iframe
                                        src={getEmbedUrl(currentLesson.videoUrl)}
                                        title={currentLesson.title}
                                        width="100%"
                                        height="100%"
                                        frameBorder="0"
                                        allowFullScreen
                                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                                    ></iframe>
                                )}
                            </div>
                            <div className="lesson-description">
                                <h3>About this lesson</h3>
                                <p>{currentLesson.description}</p>
                            </div>
                        </>
                    ) : (
                        <div className="no-lesson">
                            <p>Select a lesson to start learning</p>
                        </div>
                    )}
                </div>

                <div className="lessons-list">
                    <h3>Course Lessons</h3>
                    <ul>
                        {lessons.map((lesson, index) => (
                            <li
                                key={index}
                                className={currentLesson === lesson ? 'active' : ''}
                                onClick={() => handleLessonSelect(lesson)}
                            >
                                <span className="lesson-number">{index + 1}</span>
                                <span className="lesson-title">{lesson.title}</span>
                                <span className="lesson-duration">{lesson.duration}</span>
                            </li>
                        ))}
                    </ul>
                </div>
            </div>
        </div>
    );
};

export default CourseDetail; 