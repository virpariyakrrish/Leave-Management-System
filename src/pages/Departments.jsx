import React, { useState, useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useLeaves } from '../hooks/useLeaves';
import { useAuth } from '../context/AuthContext';
import {
  FiLayers,
  FiPlus,
  FiUsers,
  FiSearch,
  FiCheckCircle,
  FiClock,
  FiBriefcase
} from 'react-icons/fi';
import DepartmentCard from '../components/departments/DepartmentCard';
import DepartmentDetailView from '../components/departments/DepartmentDetailView';
import AddDepartmentModal from '../components/departments/AddDepartmentModal';
import { getEmployeePresenceStatus } from '../utils/departmentUtils';

export const Departments = () => {
  const { departments, users, leaveRequests, leaveTypes, loading, refreshData } = useLeaves();
  const { isManager } = useAuth();
  const [searchParams, setSearchParams] = useSearchParams();

  const [searchTerm, setSearchTerm] = useState('');
  const [modalOpen, setModalOpen] = useState(false);

  // Selected department ID from URL query param ?dept=dept-1
  const selectedDeptId = searchParams.get('dept');

  const selectedDepartment = useMemo(() => {
    if (!selectedDeptId) return null;
    return departments.find((d) => d.id === selectedDeptId) || null;
  }, [selectedDeptId, departments]);

  const handleSelectDepartment = (deptId) => {
    setSearchParams({ dept: deptId });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleBackToOverview = () => {
    setSearchParams({});
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Filtered departments for directory overview
  const filteredDepartments = useMemo(() => {
    if (!searchTerm.trim()) return departments;
    const term = searchTerm.toLowerCase();
    return departments.filter(
      (d) =>
        d.name.toLowerCase().includes(term) ||
        (d.description && d.description.toLowerCase().includes(term))
    );
  }, [departments, searchTerm]);

  // Overall company stats across all departments
  const overallStats = useMemo(() => {
    let awayCount = 0;
    let activeCount = 0;

    users.forEach((user) => {
      const presence = getEmployeePresenceStatus(user.id, leaveRequests);
      if (presence.isAway) {
        awayCount++;
      } else {
        activeCount++;
      }
    });

    return {
      totalDepts: departments.length,
      totalUsers: users.length,
      activeToday: activeCount,
      awayToday: awayCount
    };
  }, [departments, users, leaveRequests]);

  if (loading && departments.length === 0) {
    return (
      <div className="page-loading-state">
        <div className="spinner" />
        <p>Loading departments...</p>
      </div>
    );
  }

  // If a department is selected (e.g. Design, Development, QA, etc.), render the rich DepartmentDetailView!
  if (selectedDepartment) {
    return (
      <div className="dept-page-container">
        <DepartmentDetailView
          department={selectedDepartment}
          allDepartments={departments}
          users={users}
          leaveRequests={leaveRequests}
          leaveTypes={leaveTypes}
          onBack={handleBackToOverview}
          onSelectDept={handleSelectDepartment}
        />

        <AddDepartmentModal
          isOpen={modalOpen}
          onClose={() => setModalOpen(false)}
          onSuccess={async () => {
            await refreshData();
          }}
        />
      </div>
    );
  }

  // Otherwise render the Department Directory Overview
  return (
    <div className="dept-page-container">
      {/* Top Header */}
      <div className="dept-header-flex">
        <div className="dept-header-title-group">
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span className="dept-badge-pill">
              <FiLayers /> Corporate Hierarchy
            </span>
          </div>
          <h1 className="page-main-title">Departments & Teams</h1>
          <p className="page-subtitle">
            Organizational units, cross-functional teams, and real-time department availability
          </p>
        </div>

        {isManager && (
          <button
            type="button"
            className="btn-primary"
            onClick={() => setModalOpen(true)}
            style={{ display: 'inline-flex', alignItems: 'center', gap: '8px' }}
          >
            <FiPlus style={{ fontSize: '16px' }} />
            <span>Add Department</span>
          </button>
        )}
      </div>

      {/* Top 4-KPI Overview Bar */}
      <div className="dept-kpi-grid">
        <div className="dept-kpi-card card-accent-blue">
          <div className="dept-kpi-icon-box" style={{ background: '#eff6ff', color: '#2563eb' }}>
            <FiLayers />
          </div>
          <div className="dept-kpi-info">
            <span className="dept-kpi-num">{overallStats.totalDepts}</span>
            <span className="dept-kpi-label">Active Departments</span>
          </div>
        </div>

        <div className="dept-kpi-card card-accent-purple">
          <div className="dept-kpi-icon-box" style={{ background: '#faf5ff', color: '#8b5cf6' }}>
            <FiUsers />
          </div>
          <div className="dept-kpi-info">
            <span className="dept-kpi-num">{overallStats.totalUsers}</span>
            <span className="dept-kpi-label">Total Team Members</span>
          </div>
        </div>

        <div className="dept-kpi-card card-accent-green">
          <div className="dept-kpi-icon-box" style={{ background: '#ecfdf5', color: '#10b981' }}>
            <FiCheckCircle />
          </div>
          <div className="dept-kpi-info">
            <span className="dept-kpi-num" style={{ color: '#10b981' }}>{overallStats.activeToday}</span>
            <span className="dept-kpi-label">Present & Working</span>
          </div>
        </div>

        <div className="dept-kpi-card card-accent-amber">
          <div className="dept-kpi-icon-box" style={{ background: '#fffbeb', color: '#f59e0b' }}>
            <FiClock />
          </div>
          <div className="dept-kpi-info">
            <span className="dept-kpi-num" style={{ color: '#f59e0b' }}>{overallStats.awayToday}</span>
            <span className="dept-kpi-label">Currently On Leave</span>
          </div>
        </div>
      </div>

      {/* Search & Filter Toolbar */}
      <div className="dept-toolbar">
        <div className="dept-search-box">
          <FiSearch className="dept-search-icon" />
          <input
            type="text"
            placeholder="Search departments by name or domain..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="dept-search-input"
          />
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px', color: '#64748b' }}>
          <span>Showing <strong>{filteredDepartments.length}</strong> of {departments.length} departments</span>
        </div>
      </div>

      {/* Departments Cards Grid */}
      {filteredDepartments.length === 0 ? (
        <div className="content-card" style={{ textAlign: 'center', padding: '60px 20px', color: '#64748b' }}>
          <FiBriefcase style={{ fontSize: '42px', color: '#cbd5e1', marginBottom: '14px' }} />
          <h3 style={{ fontSize: '18px', fontWeight: 700, color: '#1e293b', marginBottom: '6px' }}>
            No departments found
          </h3>
          <p style={{ fontSize: '14px', color: '#64748b', maxWidth: '380px', margin: '0 auto 20px' }}>
            {searchTerm
              ? `No department matches "${searchTerm}". Try a different search term.`
              : 'There are no departments configured in the organization.'}
          </p>
          {isManager && (
            <button
              type="button"
              className="btn-primary"
              onClick={() => setModalOpen(true)}
            >
              <FiPlus style={{ marginRight: '6px' }} /> Create Department
            </button>
          )}
        </div>
      ) : (
        <div className="dept-cards-grid">
          {filteredDepartments.map((dept) => (
            <DepartmentCard
              key={dept.id}
              dept={dept}
              users={users}
              leaveRequests={leaveRequests}
              onSelect={handleSelectDepartment}
            />
          ))}
        </div>
      )}

      {/* Add Department Modal */}
      <AddDepartmentModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        onSuccess={async () => {
          await refreshData();
        }}
      />
    </div>
  );
};

export default Departments;
