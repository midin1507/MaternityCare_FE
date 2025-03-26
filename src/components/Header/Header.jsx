import { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import './Header.css';
import { useAuth } from '../../constants/AuthContext';
import api from '../../config/api';

const Header = () => {
    const { user, logout, token } = useAuth();
    const [isNotificationOpen, setIsNotificationOpen] = useState(false);
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);
    const [currentPackage, setCurrentPackage] = useState("Free");
    const notificationRef = useRef(null);
    const dropdownRef = useRef(null);
    const navigate = useNavigate();
    const reminders = JSON.parse(localStorage.getItem("reminders")) || [];

    useEffect(() => {
        const fetchCurrentUser = async () => {
            try {
                const response = await api.get('/authentications/current-user');
                setCurrentPackage(response.data.subscription);
            } catch (error) {
                console.error("Error fetching current user:", error);
            }
        };

        if (token) fetchCurrentUser();
    }, [token]);

    const checkPermission = async (e, url) => {
        try {
            const response = await api.get('/authentications/current-user');
            if (response.data.subscription === "Free") {
                alert("Vui lòng nâng cấp gói để sử dụng tính năng này!");
                e.preventDefault();
            } else {
                navigate(url);
            }
            setCurrentPackage(response.data.subscription);
        } catch (error) {
            console.error("Error fetching current user:", error);
        }
    };

    useEffect(() => {
        const fetchNotifications = async () => {
            try {
                const storedReminder = localStorage.getItem("reminder");
                if (storedReminder) {
                    reminders.push({ id: 1, description: storedReminder });
                }
            } catch (error) {
                console.error("Error fetching notifications:", error);
            }
        };
        
        fetchNotifications();
    }, []);

    const handleLogout = () => {
        logout();
        navigate('/');
        setIsDropdownOpen(false);
    };

    const toggleDropdown = () => {
        setIsDropdownOpen(!isDropdownOpen);
        setIsNotificationOpen(false); // Đóng thông báo khi mở dropdown profile
    };
    
    const toggleNotifications = () => {
        setIsNotificationOpen(!isNotificationOpen);
        setIsDropdownOpen(false); // Đóng dropdown profile khi mở thông báo
    };

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setIsDropdownOpen(false);
            }
            if (notificationRef.current && !notificationRef.current.contains(event.target)) {
                setIsNotificationOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    return (
        <header className="header">
            <div className="header-container">
                <div className="logo-section" onClick={() => navigate('/')}>
                    <Link to="/src/assets/Vector.png" className="logo-link">
                        <img src="/src/assets/Vector.png" alt="Baby Logo" className="logo" />
                        <span className="brand-name">Maternity Care</span>
                    </Link>
                </div>

                <nav className="main-nav">
                    <ul className="nav-list">
                        <li><Link to="/community">Diễn Đàn</Link></li>
                        <li>
                            <Link
                                className={currentPackage === "Free" ? "disabled" : ""}
                                onClick={(e) => checkPermission(e, "/create-fetus")}
                            >
                                Đăng ký thông tin thai nhi
                            </Link>
                        </li>
                        <li><Link to="/package-list">Dịch Vụ</Link></li>
                        <li>
                            <Link
                                className={currentPackage === "Free" ? "disabled" : ""}
                                onClick={(e) => checkPermission(e, "/booking")}
                            >
                                Đặt Lịch
                            </Link>
                        </li>
                    </ul>
                </nav>

                <div className="header-actions">
                    <div className="search-box">
                        <input type="text" placeholder="Tìm kiếm..." />
                        <button className="search-button">
                            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <circle cx="11" cy="11" r="8"></circle>
                                <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
                            </svg>
                        </button>
                    </div>

                    {/* 🔔 Nút thông báo với số lượng */}
                    <div className="notification-container">
                    <button className="notification-button" onClick={toggleNotifications}>
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"></path>
                            <path d="M13.73 21a2 2 0 0 1-3.46 0"></path>
                        </svg>
                        {reminders.length > 0 && <span className="notification-badge">{reminders.length}</span>}
                    </button>
                    {isNotificationOpen && (
                            <div className="dropdown-menu">
                                {reminders.length > 0 ? (
                                    reminders.map((reminder) => (
                                        <div key={reminder.id} className="dropdown-item">{reminder.description}</div>
                                    ))
                                ) : (
                                    <div className="dropdown-item">Không có thông báo</div>
                                )}
                            </div>
                        )}
                </div>

                    {user ? (
                        <div className="profile-dropdown" ref={dropdownRef}>
                            <button className="profile-button" onClick={toggleDropdown}>
                                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
                                    <circle cx="12" cy="7" r="4"></circle>
                                </svg>
                            </button>
                            {isDropdownOpen && (
                                <div className="dropdown-menu">
                                    <Link to="/profile" className="dropdown-item">Hồ sơ người dùng</Link>
                                    <Link to="/view-fetus-health" className="dropdown-item">Hồ sơ sức khỏe</Link>
                                    <Link to="/manage-pregnancy" className="dropdown-item">Quản lý thông tin thai </Link>
                                    <Link to="/manage-preg" className="dropdown-item">Quản lý thai kỳ</Link>
                                    <button className="dropdown-item logout-button" onClick={handleLogout}>
                                        Đăng xuất
                                    </button>
                                </div>
                            )}
                        </div>
                    ) : (
                        <div className="auth-links">
                            <Link to="/login" className="login-link">Đăng nhập</Link>
                            <Link to="/register" className="register-link">/Đăng Ký</Link>
                        </div>
                    )}
                </div>
            </div>
        </header>
    );
};

export default Header;
